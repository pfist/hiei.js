import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { Collection, REST } from 'discord.js'
import { discoverFiles } from '../utilities/file-util.js'
import * as util from '../utilities/interaction-util.js'
import * as log from '../utilities/log-util.js'
import { dispatch, Events } from './dispatch.js'

export async function createInteractionHandler (client, config) {
  const commands = new Collection()
  const buttons = new Collection()
  const modals = new Collection()
  const selects = new Collection()
  const commandsPath = resolve(config.commandsDirectory)
  const buttonsPath = config.buttonsDirectory ? resolve(config.buttonsDirectory) : null
  const modalsPath = config.modalsDirectory ? resolve(config.modalsDirectory) : null
  const selectsPath = config.selectsDirectory ? resolve(config.selectsDirectory) : null

  client.once('clientReady', async () => {
    // Load commands
    if (!statSync(commandsPath).isDirectory()) {
      throw new Error(`[hiei] Commands directory ${commandsPath.slice(process.cwd().length)} not found.`)
    }

    await loadCommands(commandsPath)

    // Load buttons
    if (buttonsPath) {
      if (!statSync(buttonsPath).isDirectory()) {
        log.warn(`Buttons directory ${buttonsPath.slice(process.cwd().length)} not found.`)
      }

      await loadButtons(buttonsPath)
    }

    // Load modals
    if (modalsPath) {
      if (!statSync(modalsPath).isDirectory()) {
        log.warn(`Modals directory ${modalsPath.slice(process.cwd().length)} not found.`)
      }

      await loadModals(modalsPath)
    }

    // Load selects
    if (selectsPath) {
      if (!statSync(selectsPath).isDirectory()) {
        log.warn(`Selects directory ${selectsPath.slice(process.cwd().length)} not found.`)
      }

      await loadSelects(selectsPath)
    }

    // Register commands
    await registerCommands()
  })

  client.on('interactionCreate', handleInteraction)

  async function loadCommands (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return log.warn(`Commands directory ${commandsPath.slice(process.cwd().length)} is empty.`)
    }

    for (const file of files) {
      try {
        const { default: command } = await import(pathToFileURL(file))
        let data

        switch (command.interaction) {
          case 'slash':
            data = await util.buildSlashCommand(command)
            break
          case 'message':
            data = await util.buildMessageCommand(command)
            break
          case 'user':
            data = await util.buildUserCommand(command)
            break
          default:
            throw new Error(`[hiei] Unknown command interaction type: ${command.interaction}`)
        }

        commands.set(command.name, { ...command, data })
      } catch (error) {
        log.error(`Failed to load command: ${file}`, error)
      }
    }

    log.info(`Loaded ${commands.size} ${commands.size === 1 ? 'command' : 'commands'} from ${commandsPath.slice(process.cwd().length)}`)
  }

  async function loadButtons (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return log.warn(`Buttons directory ${buttonsPath.slice(process.cwd().length)} is empty.`)
    }

    for (const file of files) {
      try {
        const { default: button } = await import(pathToFileURL(file))

        if (button.interaction === 'button') {
          buttons.set(button)
        } else {
          throw new Error(`[hiei] Unknown button interaction type: ${button.interaction}`)
        }
      } catch (error) {
        log.error(`Failed to load button: ${file}`, error)
      }
    }

    log.info(`Loaded ${buttons.size} ${buttons.size === 1 ? 'button' : 'buttons'} from ${buttonsPath.slice(process.cwd().length)}`)
  }

  async function loadModals (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return log.warn(`Modals directory ${modalsPath.slice(process.cwd().length)} is empty.`)
    }

    for (const file of files) {
      try {
        const { default: modal } = await import(pathToFileURL(file))

        if (modal.interaction === 'modal') {
          modals.set(modal)
        } else {
          throw new Error(`[hiei] Unknown modal interaction type: ${modal.interaction}`)
        }
      } catch (error) {
        log.error(`Failed to load modal: ${file}`, error)
      }
    }

    log.info(`Loaded ${modals.size} ${modals.size === 1 ? 'modal' : 'modals'} from ${modalsPath.slice(process.cwd().length)}`)
  }

  async function loadSelects (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return log.warn(`Selects directory ${selectsPath.slice(process.cwd().length)} is empty.`)
    }

    for (const file of files) {
      try {
        const { default: select } = await import(pathToFileURL(file))

        if (select.interaction.startsWith('select')) {
          selects.set(select)
        } else {
          throw new Error(`[hiei] Unknown select interaction type: ${select.interaction}`)
        }
      } catch (error) {
        log.error(`Failed to load select: ${file}`, error)
      }
    }

    log.info(`Loaded ${selects.size} ${selects.size === 1 ? 'select' : 'selects'} from ${selectsPath.slice(process.cwd().length)}`)
  }

  async function handleInteraction (interaction) {
    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        log.warn(`Command '${interaction.commandName}' sent autocomplete interaction but has no handler.`)
        return
      }

      if (typeof command.autocomplete !== 'function') {
        log.warn(`Autocomplete interaction received for command '${interaction.commandName}' but no autocomplete() method is defined.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        const choices = await command.autocomplete(interaction)
        await interaction.respond(choices)
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error(`Autocomplete for command '${interaction.commandName}' encountered an error:`, error)
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
        log.warn(`Slash command '${interaction.commandName}' has no handler.`)
        return
      }

      if (typeof command.execute !== 'function') {
        log.warn(`Slash command '${interaction.commandName}' has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await command.execute({ interaction, client, components })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error(`Slash command '${interaction.commandName}' failed to execute`, error)
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
        log.warn(`Message command '${interaction.commandName}' has no handler.`)
        return
      }

      if (typeof command.execute !== 'function') {
        log.warn(`Message command '${interaction.commandName}' has no execute() method.`)
        return
      }

      try {
        const message = interaction.options.getMessage('message')
        dispatch.emit(Events.Interaction.Started, interaction)
        await command.execute({ interaction, message, client, components })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error(`Message command '${interaction.commandName}' failed to execute`, error)
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
        log.warn(`User command '${interaction.commandName}' has no handler.`)
        return
      }

      if (typeof command.execute !== 'function') {
        log.warn(`User command '${interaction.commandName}' has no execute() method.`)
        return
      }

      try {
        const user = interaction.options.getUser('user')
        dispatch.emit(Events.Interaction.Started, interaction)
        await command.execute({ interaction, user, client, components })
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error(`User command '${interaction.commandName}' failed to execute`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Button
    if (interaction.isButton()) {
      const button = buttons.get(interaction.customId)
      if (!button) {
        log.warn(`Button '${interaction.customId}' has no handler.`)
        return
      }

      if (typeof button.execute !== 'function') {
        log.warn(`Button '${interaction.customId}' has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await button.execute(interaction, client)
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error(`Button '${interaction.customId}' failed to execute`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Select menu
    if (interaction.isAnySelectMenu()) {
      const select = selects.get(interaction.customId)
      if (!select) {
        log.warn(`Select menu '${interaction.customId}' has no handler.`)
        return
      }

      if (typeof select.execute !== 'function') {
        log.warn(`Select menu '${interaction.customId}' has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await select.execute(interaction, client)
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error(`Select menu '${interaction.customId}' failed to execute`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }

    // Modal submission
    if (interaction.isModalSubmit()) {
      const modal = modals.get(interaction.customId)
      if (!modal) {
        log.warn(`Modal submission '${interaction.customId}' has no handler.`)
        return
      }

      if (typeof modal.execute !== 'function') {
        log.warn(`Modal submission '${interaction.customId}' has no execute() method.`)
        return
      }

      try {
        dispatch.emit(Events.Interaction.Started, interaction)
        await modal.execute(interaction, client)
        dispatch.emit(Events.Interaction.Completed, interaction)
      } catch (error) {
        log.error(`Modal submission '${interaction.customId}' failed to execute`, error)
        dispatch.emit(Events.Interaction.Failed, {
          interaction,
          error
        })
      }
    }
  }

  async function normalizeCommand (command) {
    const normalized = {
      type: command.type !== undefined ? command.type : 1,
      name: command.name,
      description: command.description ? command.description : '',
      defaultMemberPermissions: command.permissions
    }

    if (command.options !== undefined && command.options.length > 0) normalized.options = command.options
    return normalized
  }

  async function registerCommands () {
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
      log.error('Failed to fetch remote commands.', error)
    }

    const localMap = new Map(localCommands.map(cmd => [cmd.name, normalizeCommand(cmd)]).sort())
    const remoteMap = new Map(remoteCommands.map(cmd => [cmd.name, normalizeCommand(cmd)]).sort())

    const needsUpdate = !isDeepStrictEqual(localMap, remoteMap)

    if (config.debug) {
      console.debug('[DEBUG] Compare local and remote command data below if sync is misbehaving')
      console.debug('Local:', JSON.stringify(Object.fromEntries(localMap), null, 2))
      console.debug('Remote:', JSON.stringify(Object.fromEntries(remoteMap), null, 2))
    }

    // Check for modified command data
    log.info('Checking for changes in command data...')
    if (needsUpdate) {
      try {
        log.info('Changes found. Updating guild commands...')
        await rest.put(`/applications/${application}/guilds/${guild}/commands`, { body: localCommands })
        log.info('Guild commands updated successfully.')
        dispatch.emit(Events.Sync.Completed, {
          guild: guild.id,
          remote: remoteCommands
        })
      } catch (error) {
        log.error('Failed to sync commands.', error)
        dispatch.emit(Events.Sync.Failed, {
          guild: guild.id,
          local: localCommands,
          remote: remoteCommands,
          error
        })
      }
    } else {
      log.info('No changes found.')
    }
  }
}
