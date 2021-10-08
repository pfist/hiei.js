import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
import { getFiles, sortByKey } from '../HieiUtil.js'

export class CommandHandler extends EventEmitter {
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

      const commandData = this.commands.map(cmd => {
        return {
          name: cmd.name,
          description: cmd.description,
          defaultPermission: cmd.defaultPermission,
          options: cmd.options,
          type: cmd.type
        }
      })

      const permissionData = this.commands.map(cmd => {
        return {
          name: cmd.name,
          permissions: cmd.permissions
        }
      })

      await this.syncCommands(commandData)
      await this.syncPermissions(permissionData)
    })

    this.client.on('interactionCreate', async i => {
      if (!i.isCommand() && !i.isContextMenu()) return
      const perms = await i.guild.commands.permissions.fetch(i.commandId)
      console.log(`[Interaction]\n  Name: ${i.commandName}\n  isCommand: ${i.isCommand()}\n  isContextMenu: ${i.isContextMenu()}\n  Type: ${i.command.type}\n  Permissions: ${perms}`)

      // Handle slash commands
      if (i.isCommand()) {
        return this.handleSlashCommand(i)
      }

      // Handle message commands
      if (i.isContextMenu() && i.command.type === 'MESSAGE') {
        return this.handleMessageCommand(i, i.options.getMessage('message'))
      }

      // Handle user commands
      if (i.isContextMenu() && i.command.type === 'USER') {
        return this.handleUserCommand(i, i.options.getUser('user'))
      }
    })
  }

  async syncCommands (data) {
    const localCommands = sortByKey(data, 'name')
    const remoteData = await this.client.guilds.cache.get(process.env.GUILD)?.commands.fetch()
    const remoteCommands = sortByKey(remoteData.map(cmd => {
      return { name: cmd.name, description: cmd.description, options: cmd.options, type: cmd.type }
    }), 'name')

    // console.log('Local Commands:', JSON.stringify(localCommands))
    // console.log('Remote Commands:', JSON.stringify(remoteCommands))

    if (JSON.stringify(localCommands) === JSON.stringify(remoteCommands)) {
      return console.log('Command registry in sync')
    }

    console.log(`Command registry has changed, ${localCommands.length} commands will be registered`)

    // Register commands
    await this.client.guilds.cache.get(process.env.GUILD).commands.set(localCommands)
  }

  async syncPermissions (data) {
    const commands = await this.client.guilds.cache.get(process.env.GUILD)?.commands.fetch()
    const fullPermissions = commands.map(cmd => {
      return {
        id: cmd.id,
        permissions: this.commands.get(cmd.name).permissions
      }
    })

    console.log('Permissions:', JSON.stringify(fullPermissions, null, 2))

    // Set permissions
    await this.client.guilds.cache.get(process.env.GUILD).commands.permissions.set({ fullPermissions })
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
}

export default CommandHandler
