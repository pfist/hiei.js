import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
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

export async function createInteractionHandler (client, { commandDirectory, componentDirectory }) {
  const commands = new Collection()
  const components = new Collection()

  client.once('ready', async () => {
    await loadCommands(resolve(process.cwd(), commandDirectory))
    await loadComponents(resolve(process.cwd(), componentDirectory))
    await syncCommands()
  })

  client.on('interactionCreate', handleInteraction)

  async function loadCommands (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return console.warn(`No command files found in directory: ${directory}`)
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
            throw new Error(`Unknown command interaction type: ${command.interaction}`)
        }

        commands.set(command.name, { ...command, data })
      } catch (error) {
        console.error(`Failed to load command: ${file}`, error)
      }
    }

    console.log(`Loaded ${commands.size} ${commands.size === 1 ? 'command' : 'commands'} from ${directory}`)
  }

  async function loadComponents (directory) {
    const files = await discoverFiles(directory)
    if (!files.length) {
      return console.warn(`No component files found in directory: ${directory}`)
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
            throw new Error(`Unknown component interaction type: ${component.interaction}`)
        }

        components.set(`${component.interaction}:${component.id}`, { ...component, data })
      } catch (error) {
        console.error(`Failed to load component: ${file}`, error)
      }
    }

    console.log(`Loaded ${components.size} ${components.size === 1 ? 'component' : 'components'} from ${directory}`)
  }

  async function handleInteraction (interaction) {
    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`Command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.autocomplete !== 'function') {
        console.warn(`Autocomplete interaction received for command "${interaction.commandName}" but no autocomplete() method is defined.`)
        return
      }

      try {
        const choices = await command.autocomplete(interaction)
        await interaction.respond(choices)
      } catch (error) {
        console.error(`Autocomplete for command "${interaction.commandName}" encountered an error:`, error)
      }
    }

    // Slash command
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`Slash command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        console.warn(`Slash command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        await command.execute(interaction, client)
      } catch (error) {
        console.error(`Error executing slash command "${interaction.commandName}":`, error)
      }
    }

    // Message command
    if (interaction.isMessageContextMenuCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`Message command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        console.warn(`Message command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        await command.execute(interaction, client)
      } catch (error) {
        console.error(`Error executing message command "${interaction.commandName}":`, error)
      }
    }

    // User command
    if (interaction.isUserContextMenuCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) {
        console.warn(`User command "${interaction.commandName}" not found.`)
        return
      }

      if (typeof command.execute !== 'function') {
        console.warn(`User command "${interaction.commandName}" has no execute() method.`)
        return
      }

      try {
        await command.execute(interaction, client)
      } catch (error) {
        console.error(`Error executing user command "${interaction.commandName}":`, error)
      }
    }

    // Button component
    if (interaction.isButton()) {
      const component = components.get(`button:${interaction.customId}`)
      if (!component) {
        console.warn(`Button component "${interaction.customId}" not found.`)
        return
      }

      if (typeof component.execute !== 'function') {
        console.warn(`Button component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        await component.execute(interaction, client)
      } catch (error) {
        console.error(`Error executing button component "${interaction.customId}":`, error)
      }
    }

    // Select menu component
    if (interaction.isAnySelectMenu()) {
      const component = components.get(`select:${interaction.customId}`)
      if (!component) {
        console.warn(`Select menu component "${interaction.customId}" not found.`)
        return
      }

      if (typeof component.execute !== 'function') {
        console.warn(`Select menu component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        await component.execute(interaction, client)
      } catch (error) {
        console.error(`Error executing select menu component "${interaction.customId}":`, error)
      }
    }

    // Modal component
    if (interaction.isModalSubmit()) {
      const component = components.get(`modal:${interaction.customId}`)
      if (!component) {
        console.warn(`Modal component "${interaction.customId}" not found.`)
        return
      }

      if (typeof component.execute !== 'function') {
        console.warn(`Modal component "${interaction.customId}" has no execute() method.`)
        return
      }

      try {
        await component.execute(interaction, client)
      } catch (error) {
        console.error(`Error executing modal component "${interaction.customId}":`, error)
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
      console.error('Command sync: Failed to fetch remote commands.', error)
    }

    const localMap = new Map(localCommands.map(cmd => [cmd.name, cmd]))
    const remoteMap = new Map(remoteCommands.map(cmd => [cmd.name, stripRemoteCommand(cmd)]))

    let needsUpdate = false

    // Check for new or modified commands
    console.log('Command sync: Checking for new or modified commands...')
    for (const [name, local] of localMap) {
      const remote = remoteMap.get(name)
      if (!remote || JSON.stringify(local) !== JSON.stringify(remote)) {
        needsUpdate = true
        break
      }
    }

    // Check for deleted commands
    console.log('Command sync: Checking for deleted commands...')
    if (!needsUpdate) {
      for (const name of remoteMap.keys()) {
        if (!localMap.has(name)) {
          needsUpdate = true
          break
        }
      }
    }

    if (!needsUpdate) {
      console.log('Command sync: No changes found.')
      return
    }

    try {
      console.log('Command sync: Changes found. Updating guild commands...')
      await rest.put(`/applications/${application}/guilds/${guild}/commands`, { body: localCommands })
      console.log('Command sync: Guild commands updated successfully.')
    } catch (error) {
      console.error('Command sync: Failed to sync commands.', error)
    }
  }
}
