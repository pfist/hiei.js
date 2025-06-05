import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { Collection, REST } from 'discord.js'
import { discoverFiles } from '../utilities/file-util.js'
import { dispatch, Events } from './dispatch.js'
import * as log from '../utilities/log-util.js'
import {
  buildSlashCommand,
  buildMessageCommand,
  buildUserCommand,
  buildButtonComponent,
  buildModalComponent,
  buildSelectComponent
} from '../utilities/interaction-util.js'

export async function createInteractionHandler (client, { commandDirectory = './src/commands', componentDirectory = './src/components' }) {
  const commands = new Collection()
  const components = new Collection()

  const commandsPath = resolve(process.cwd(), commandDirectory)
  const commandsPathRelative = commandsPath.startsWith(process.cwd()) ? '.' + commandsPath.slice(process.cwd().length) : commandsPath
  const componentsPath = resolve(process.cwd(), componentDirectory)
  const componentsPathRelative = componentsPath.startsWith(process.cwd()) ? '.' + componentsPath.slice(process.cwd().length) : componentsPath

  if (!existsSync(commandsPath)) {
    log.error('setup', `There is no commands directory. Please create one at ${commandsPathRelative} or define a custom path in your interaction handler.`)
    process.exit(1)
  }

  const componentsEnabled = existsSync(componentsPath)

  if (!componentsEnabled) {
    log.warn('setup', 'There is no components directory. Components will be disabled.')
  }

  client.once('ready', async () => {
    await loadCommands(commandsPath)

    if (componentsEnabled) {
      await loadComponents(componentsPath)
    }

    await syncCommands()
  })

  client.on('interactionCreate', handleInteraction)

  async function loadCommands (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return log.warn('setup', `Commands directory is empty: ${commandsPathRelative}`)
    }

    for (const file of files) {
      try {
        const { default: command } = await import(pathToFileURL(file))
        let data

        switch (command.interaction) {
          case 'slash':
            data = await buildSlashCommand(command)
            break
          case 'message':
            data = await buildMessageCommand(command)
            break
          case 'user':
            data = await buildUserCommand(command)
            break
          default:
            throw new Error(`[hiei:setup] Unknown command interaction type: ${command.interaction}`)
        }

        commands.set(command.name, { ...command, data })
      } catch (error) {
        log.error('setup', `Failed to load command: ${file}`, error)
      }
    }

    log.info('setup', `Loaded ${commands.size} ${commands.size === 1 ? 'command' : 'commands'} from ${commandsPathRelative}`)
  }

  async function loadComponents (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return log.warn('setup', `Components directory is empty: ${componentsPathRelative}`)
    }

    for (const file of files) {
      try {
        const { default: component } = await import(pathToFileURL(file))
        let data

        switch (component.interaction) {
          case 'button':
            data = await buildButtonComponent(component)
            break
          case 'modal':
            data = await buildModalComponent(component)
            break
          case 'select':
            data = await buildSelectComponent(component)
            break
          default:
            throw new Error(`[hiei:setup] Unknown component interaction type ${component.interaction} in file ${file}`)
        }

        components.set(`${component.interaction}:${component.id}`, { ...component, data })
      } catch (error) {
        log.error('setup', `Failed to load component: ${file}`, error)
      }
    }

    log.info('setup', `Loaded ${components.size} ${components.size === 1 ? 'component' : 'components'} from ${componentsPathRelative}`)
  }

  async function handleInteraction (interaction) {
    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        log.warn('interactions', `Command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.autocomplete !== 'function') {
        log.warn('interactions', `Autocomplete interaction received for command "${interaction.commandName}" but no autocomplete() method is defined.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        const choices = await command.autocomplete(interaction)
        await interaction.respond(choices)
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error('interactions', `Autocomplete for command "${interaction.commandName}" encountered an error:`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Slash command
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        log.warn('interactions', `Slash command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        log.warn('interactions', `Slash command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await command.execute({ interaction, client, components })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error('interactions', `Error executing slash command "${interaction.commandName}":`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Message command
    if (interaction.isMessageContextMenuCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        log.warn('interactions', `Message command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        log.warn('interactions', `Message command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        const message = interaction.options.getMessage('message')
        dispatch.emit(Events.Interaction.Started, interaction)
        await command.execute({ interaction, message, client, components })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error('interactions', `Error executing message command "${interaction.commandName}":`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // User command
    if (interaction.isUserContextMenuCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        log.warn('interactions', `User command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        log.warn('interactions', `User command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        const user = interaction.options.getUser('user')
        dispatch.emit(Events.Interaction.Started, interaction)
        await command.execute({ interaction, user, client, components })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error('interactions', `Error executing user command "${interaction.commandName}":`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Button component
    if (interaction.isButton()) {
      const component = components.get(`button:${interaction.customId}`)
      if (!component) {
        log.warn('interactions', `Button component "${interaction.customId}" not found. This warning can be safely ignored for contextual buttons.`)
        return
      }

      if (typeof component.execute !== 'function') {
        log.warn('interactions', `Button component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await component.execute({ interaction, client })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error('interactions', `Error executing button component "${interaction.customId}":`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Select menu component
    if (interaction.isAnySelectMenu()) {
      const component = components.get(`select:${interaction.customId}`)
      if (!component) {
        log.warn('interactions', `Select menu component "${interaction.customId}" not found. This warning can be safely ignored for contextual select menus.`)
        return
      }

      if (typeof component.execute !== 'function') {
        log.warn('interactions', `Select menu component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await component.execute({ interaction, client })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error('interactions', `Error executing select menu component "${interaction.customId}":`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Modal component
    if (interaction.isModalSubmit()) {
      const component = components.get(`modal:${interaction.customId}`)
      if (!component) {
        log.warn('interactions', `Modal component "${interaction.customId}" not found. This warning can be safely ignored for contextual modals.`)
        return
      }

      if (typeof component.execute !== 'function') {
        log.warn('interactions', `Modal component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await component.execute({ interaction, client })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error('interactions', `Error executing modal component "${interaction.customId}":`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }
  }

  function normalizeCommand (command) {
    const normalized = {
      type: command.type !== undefined ? command.type : 1,
      name: command.name,
      description: command.description ? command.description : '',
      defaultMemberPermissions: command.defaultMemberPermissions
    }

    if (command.options !== undefined && command.options.length > 0) normalized.options = command.options
    return normalized
  }

  async function syncCommands () {
    const rest = new REST({ version: '10' }).setToken(client.token)
    const application = client.application.id
    const guild = process.env.GUILD
    const localCommands = Array.from(commands.values()).map(cmd => cmd.data.toJSON())
    let remoteCommands

    dispatch.emit(Events.Sync.Started, {
      guild: guild.id,
      commands: localCommands
    })

    try {
      remoteCommands = await rest.get(`/applications/${application}/guilds/${guild}/commands`)
    } catch (error) {
      log.error('sync', 'Failed to fetch remote commands.', error)
    }

    const localMap = new Map(localCommands.map(cmd => [cmd.name, normalizeCommand(cmd)]))
    const remoteMap = new Map(remoteCommands.map(cmd => [cmd.name, normalizeCommand(cmd)]))

    let needsUpdate = false

    // DEBUG - Uncomment these to if you are debuygging command sync
    // console.debug('Local:', JSON.stringify(Object.fromEntries(localMap), null, 2))
    // console.debug('Remote:', JSON.stringify(Object.fromEntries(remoteMap), null, 2))

    // Check for new or modified commands
    log.info('sync', 'Checking for new or modified commands...')
    for (const [name, local] of localMap) {
      const remote = remoteMap.get(name)
      if (!remote || JSON.stringify(local) !== JSON.stringify(remote)) {
        needsUpdate = true
        break
      }
    }

    // Check for deleted commands
    log.info('sync', 'Checking for deleted commands...')
    if (!needsUpdate) {
      for (const name of remoteMap.keys()) {
        if (!localMap.has(name)) {
          needsUpdate = true
          break
        }
      }
    }

    if (!needsUpdate) {
      log.info('sync', 'No changes found.')
      return
    }

    try {
      log.info('sync', 'Changes found. Updating guild commands...')
      await rest.put(`/applications/${application}/guilds/${guild}/commands`, { body: localCommands })
      log.info('sync', 'Guild commands updated successfully.')
      dispatch.emit(Events.Sync.Completed, {
        guild: guild.id,
        remote: remoteCommands
      })
    } catch (error) {
      log.error('sync', 'Failed to sync commands.', error)
      dispatch.emit(Events.Sync.Failed, {
        guild: guild.id,
        local: localCommands,
        remote: remoteCommands,
        error
      })
    }
  }
}
