import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { Collection, REST } from 'discord.js'
import { discoverFiles } from '../utilities/file-util.js'
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
  const componentsPath = resolve(process.cwd(), componentDirectory)

  if (!existsSync(commandsPath)) {
    console.error(`[hiei:commands] There is no command directory. Please create one at ${commandsPath} or define a custom path in your interaction handler.`)
    process.exit(1)
  }

  const componentsEnabled = existsSync(componentsPath)

  if (!componentsEnabled) {
    console.warn('[hiei:components] There is no component directory. Components will be disabled.')
    process.exit(1)
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
      return console.warn(`[hiei:commands] Command directory is empty: ${directory}`)
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
            throw new Error(`[hiei:commands] Unknown command interaction type: ${command.interaction}`)
        }

        commands.set(command.name, { ...command, data })
      } catch (error) {
        console.error(`[hiei:commands] Failed to load command: ${file}`, error)
      }
    }

    console.log(`[hiei:commands] Loaded ${commands.size} ${commands.size === 1 ? 'command' : 'commands'} from ${directory}`)
  }

  async function loadComponents (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return console.warn(`[hiei:components] Component directory is empty: ${directory}`)
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
            throw new Error(`[hiei:components] Unknown component interaction type: ${component.interaction}`)
        }

        components.set(`${component.interaction}:${component.id}`, { ...component, data })
      } catch (error) {
        console.error(`[hiei:components] Failed to load component: ${file}`, error)
      }
    }

    console.log(`[hiei:components] Loaded ${components.size} ${components.size === 1 ? 'component' : 'components'} from ${directory}`)
  }

  async function handleInteraction (interaction) {
    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`[hiei:interactions] Command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.autocomplete !== 'function') {
        console.warn(`[hiei:interactions] Autocomplete interaction received for command "${interaction.commandName}" but no autocomplete() method is defined.`)
        return
      }

      try {
        const choices = await command.autocomplete(interaction)
        await interaction.respond(choices)
      } catch (error) {
        console.error(`[hiei:interactions] Autocomplete for command "${interaction.commandName}" encountered an error:`, error)
      }
    }

    // Slash command
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`[hiei:interactions] Slash command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        console.warn(`[hiei:interactions] Slash command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        await command.execute(interaction, client)
      } catch (error) {
        console.error(`[hiei:interactions] Error executing slash command "${interaction.commandName}":`, error)
      }
    }

    // Message command
    if (interaction.isMessageContextMenuCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`[hiei:interactions] Message command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        console.warn(`[hiei:interactions] Message command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        await command.execute(interaction, client)
      } catch (error) {
        console.error(`[hiei:interactions] Error executing message command "${interaction.commandName}":`, error)
      }
    }

    // User command
    if (interaction.isUserContextMenuCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`[hiei:interactions] User command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        console.warn(`[hiei:interactions] User command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        await command.execute(interaction, client)
      } catch (error) {
        console.error(`[hiei:interactions] Error executing user command "${interaction.commandName}":`, error)
      }
    }

    // Button component
    if (interaction.isButton()) {
      const component = components.get(`button:${interaction.customId}`)
      if (!component) {
        console.warn(`[hiei:interactions] Button component "${interaction.customId}" not found. This warning can be safely ignored for contextual buttons.`)
        return
      }

      if (typeof component.execute !== 'function') {
        console.warn(`[hiei:interactions] Button component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        await component.execute(interaction, client)
      } catch (error) {
        console.error(`[hiei:interactions] Error executing button component "${interaction.customId}":`, error)
      }
    }

    // Select menu component
    if (interaction.isAnySelectMenu()) {
      const component = components.get(`select:${interaction.customId}`)
      if (!component) {
        console.warn(`[hiei:interactions] Select menu component "${interaction.customId}" not found. This warning can be safely ignored for contextual select menus.`)
        return
      }

      if (typeof component.execute !== 'function') {
        console.warn(`[hiei:interactions] Select menu component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        await component.execute(interaction, client)
      } catch (error) {
        console.error(`[hiei:interactions] Error executing select menu component "${interaction.customId}":`, error)
      }
    }

    // Modal component
    if (interaction.isModalSubmit()) {
      const component = components.get(`modal:${interaction.customId}`)
      if (!component) {
        console.warn(`[hiei:interactions] Modal component "${interaction.customId}" not found. This warning can be safely ignored for contextual modals.`)
        return
      }

      if (typeof component.execute !== 'function') {
        console.warn(`[hiei:interactions] Modal component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        await component.execute(interaction, client)
      } catch (error) {
        console.error(`[hiei:interactions] Error executing modal component "${interaction.customId}":`, error)
      }
    }
  }

  function stripRemoteCommand (command) {
    return {
      type: command.type,
      name: command.name,
      description: command.description,
      options: command.options,
      defaultMemberPermissions: command.defaultMemberPermissions
    }
  }

  async function syncCommands () {
    const rest = new REST({ version: '10' }).setToken(client.token)
    const application = client.application.id
    const guild = process.env.GUILD
    const localCommands = Array.from(commands.values()).map(cmd => cmd.data.toJSON())
    let remoteCommands

    try {
      remoteCommands = await rest.get(`/applications/${application}/guilds/${guild}/commands`)
    } catch (error) {
      console.error('[hiei:sync] Failed to fetch remote commands.', error)
    }

    const localMap = new Map(localCommands.map(cmd => [cmd.name, cmd]))
    const remoteMap = new Map(remoteCommands.map(cmd => [cmd.name, stripRemoteCommand(cmd)]))

    let needsUpdate = false

    // Check for new or modified commands
    console.log('[hiei:sync] Checking for new or modified commands...')
    for (const [name, local] of localMap) {
      const remote = remoteMap.get(name)
      if (!remote || JSON.stringify(local) !== JSON.stringify(remote)) {
        needsUpdate = true
        break
      }
    }

    // Check for deleted commands
    console.log('[hiei:sync] Checking for deleted commands...')
    if (!needsUpdate) {
      for (const name of remoteMap.keys()) {
        if (!localMap.has(name)) {
          needsUpdate = true
          break
        }
      }
    }

    if (!needsUpdate) {
      console.log('[hiei:sync] No changes found.')
      return
    }

    try {
      console.log('[hiei:sync] Changes found. Updating guild commands...')
      await rest.put(`/applications/${application}/guilds/${guild}/commands`, { body: localCommands })
      console.log('[hiei:sync] Guild commands updated successfully.')
    } catch (error) {
      console.error('[hiei:sync] Failed to sync commands.', error)
    }
  }
}
