import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
import { getFiles, sortByKey } from '../HieiUtil.js'

class CommandHandler extends EventEmitter {
  /** Handles all commands found the commands directory.
   * @param {Client} client - The client this command handler runs on.
   * @param {string} directory - The directory where command files will be handled recursively.
   */
  constructor (client, directory) {
    super()

    this.client = client
    this.directory = directory
    this.commands = new Collection()

    this.init()
  }

  init () {
    this.client.once('ready', async () => {
      const files = await getFiles(this.directory)

      for (const file of files) {
        const Command = (await import(pathToFileURL(file))).default
        const c = new Command()

        c.client = this.client
        this.commands.set(c.name, c)
      }

      await this.registerCommands()
    })

    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand() && !interaction.isContextMenu()) return

      if (interaction.isCommand()) {
        return this.handleSlashCommand(interaction)
      }

      if (interaction.isContextMenu() && interaction.command.type === 'MESSAGE') {
        return this.handleMessageCommand(interaction, interaction.options.getMessage('message'))
      }

      if (interaction.isContextMenu() && interaction.command.type === 'USER') {
        return this.handleUserCommand(interaction, interaction.options.getUser('user'))
      }
    })
  }

  async handleMessageCommand (interaction, message) {
    const command = this.commands.get(interaction.commandName)

    try {
      await command.run(interaction, message)
    } catch (error) {
      console.error(error)
    }
  }

  async handleSlashCommand (interaction) {
    const command = this.commands.get(interaction.commandName)

    try {
      await command.run(interaction)
    } catch (error) {
      console.error(error)
    }
  }

  async handleUserCommand (interaction, user) {
    const command = this.commands.get(interaction.commandName)

    try {
      await command.run(interaction, user)
    } catch (error) {
      console.error(error)
    }
  }

  async getRemoteCommands () {
    const commands = await this.client.guilds.cache.get(process.env.GUILD)?.commands.fetch()
    return commands
  }

  async registerCommands () {
    const localCommands = sortByKey(this.commands.map(cmd => {
      return {
        type: cmd.type,
        name: cmd.name,
        description: cmd.description,
        options: cmd.options,
        defaultPermission: cmd.defaultPermission ? cmd.defaultPermission : true
      }
    }), 'name')

    const remoteCommandData = await this.getRemoteCommands()
    const remoteCommands = sortByKey(remoteCommandData.map(cmd => {
      return {
        type: cmd.type,
        name: cmd.name,
        description: cmd.description,
        options: cmd.options,
        defaultPermission: cmd.defaultPermission
      }
    }), 'name')

    if (this.client.debug) {
      console.log('Local Commands:', JSON.stringify(localCommands))
      console.log('Remote Commands:', JSON.stringify(remoteCommands))
    }

    if (JSON.stringify(localCommands) === JSON.stringify(remoteCommands)) {
      return console.log('No command changes detected. Skipping registration.')
    }

    await this.client.guilds.cache.get(process.env.GUILD).commands.set(localCommands)
    console.log(`${localCommands.length} commands registered.`)

    await this.setPermissions()
    console.log('Permissions updated.')
  }

  async setPermissions () {
    const commands = await this.getRemoteCommands()
    const fullPermissions = commands.map(cmd => {
      return {
        id: cmd.id,
        permissions: this.commands.get(cmd.name).permissions
      }
    })

    if (this.client.debug) {
      console.log('Permissions:', JSON.stringify(fullPermissions, null, 2))
    }

    await this.client.guilds.cache.get(process.env.GUILD).commands.permissions.set({ fullPermissions })
  }
}

export default CommandHandler
