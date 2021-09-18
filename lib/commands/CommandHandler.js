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
        const cmd = new Command()
        this.commands.set(cmd.name, cmd)
      }

      const data = this.commands.map(cmd => {
        return { name: cmd.name, description: cmd.description, options: cmd.options, type: cmd.type }
      })

      await this.syncCommands(data)
    })

    this.client.on('interactionCreate', async i => {
      console.log(`[Interaction]\n  Name: ${i.commandName}\n  isCommand: ${i.isCommand()}\n  isContextMenu: ${i.isContextMenu()}\n  Type: ${i.command.type}`)
      if (!i.isCommand() && !i.isContextMenu()) return

      // Handle slash commands
      if (i.isCommand()) {
        return this.handleSlashCommand(i)
      }

      // Handle message commands
      if (i.isContextMenu() && i.command.type === 'MESSAGE') {
        return this.handleMessageCommand(i, i.options.getMessage('message'))
      }

    })
  }

  async syncCommands (commands) {
    const localCommands = sortByKey(commands, 'name')
    const remoteData = await this.client.guilds.cache.get(process.env.GUILD)?.commands.fetch()
    const remoteCommands = sortByKey(remoteData.map(cmd => {
      return { name: cmd.name, description: cmd.description, options: cmd.options, type: cmd.type }
    }), 'name')

    console.log('Local Commands:', JSON.stringify(localCommands))
    console.log('Remote Commands:', JSON.stringify(remoteCommands))

    if (JSON.stringify(localCommands) === JSON.stringify(remoteCommands)) {
      return console.log('No changes to sync')
    }

    console.log('Commands have been modified. Syncing now...')
    return this.client.guilds.cache.get(process.env.GUILD).commands.set(localCommands)
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

}

export default CommandHandler
