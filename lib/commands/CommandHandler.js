import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
import { getFiles, sortByKey } from '../HieiUtil.js'

class CommandHandler extends EventEmitter {
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

    this.client.on('interactionCreate', async i => {
      if (!i.isCommand() && !i.isContextMenu()) return

      if (i.isCommand()) {
        return this.handleSlashCommand(i)
      }

      if (i.isContextMenu() && i.command.type === 'MESSAGE') {
        return this.handleMessageCommand(i, i.options.getMessage('message'))
      }

      if (i.isContextMenu() && i.command.type === 'USER') {
        return this.handleUserCommand(i, i.options.getUser('user'))
      }
    })
  }

  async handleMessageCommand (i, m) {
    const command = this.commands.get(i.commandName)

    try {
      await command.run(i, m)
    } catch (error) {
      console.error(error)
      await i.reply({ content: 'There was a problem running that command.', ephemeral: true })
    }
  }

  async handleSlashCommand (i) {
    const command = this.commands.get(i.commandName)

    try {
      await command.run(i)
    } catch (error) {
      console.error(error)
      await i.reply({ content: 'There was a problem running that command.', ephemeral: true })
    }
  }

  async handleUserCommand (i, u) {
    const command = this.commands.get(i.commandName)

    try {
      await command.run(i, u)
    } catch (error) {
      console.error(error)
      await i.reply({ content: 'There was a problem running that command.', ephemeral: true })
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
        defaultPermission: cmd.defaultPermission
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

    // Uncomment the two statements below to log differences between local and remote commands
    // console.log('Local Commands:', JSON.stringify(localCommands))
    // console.log('Remote Commands:', JSON.stringify(remoteCommands))

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

    console.log('Permissions:', JSON.stringify(fullPermissions, null, 2))

    await this.client.guilds.cache.get(process.env.GUILD).commands.permissions.set({ fullPermissions })
  }
}

export default CommandHandler
