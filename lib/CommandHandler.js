import { promises as fs } from 'node:fs'
import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'

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
      const files = (await fs.readdir(this.directory)).filter(f => f.endsWith('.js'))

      for (const file of files) {
        const CommandClass = (await import(pathToFileURL(`${this.directory}/${file}`))).default
        const command = new CommandClass()
        this.commands.set(command.name, command)
      }

      // console.log(this.commands)

      const data = this.commands.map(cmd => {
        return { name: cmd.name, description: cmd.description, options: cmd.options }
      })

      await this.sync(data)
    })

    this.client.on('interactionCreate', async i => {
      // this.handle(i)
      console.log(`[Interaction]\nName: ${i.commandName}\nisCommand: ${i.isCommand()}\nisContextMenu: ${i.isContextMenu()}\nSender: ${i.user}`)
    })
  }

  async sync (commands) {
    const data = await this.client.guilds.cache.get(process.env.GUILD)?.commands.fetch()
    // const local = JSON.stringify(commands.sort())
    // const remote = JSON.stringify(data.map(c => {
    //   return { name: c.name, description: c.description, options: c.options }
    // }).sort())

    const sortBy = (arr, k) => arr.sort((a, b) => (a[k] > b[k]) ? 1 : ((a[k] < b[k]) ? -1 : 0))

    const local = sortBy(commands, 'name')
    const remote = data.map(c => {
      return { name: c.name, description: c.description, options: c.options }
    })
    const remoteSorted = sortBy(remote, 'name')

    console.log('Local Commands:', JSON.stringify(local))
    console.log('Remote Commands:', JSON.stringify(remoteSorted))

    if (JSON.stringify(local) === JSON.stringify(remoteSorted)) {
      return console.log('No changes to sync')
    }

    console.log('Commands have been modified. Syncing now...')
    // return this.client.guilds.cache.get(process.env.GUILD).commands.set(commands)
  }

  async handle (i) {
    // handle slash commands
    // handle message commands
    // handle user commands
  }
}

export default CommandHandler
