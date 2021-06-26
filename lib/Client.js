import { Client } from 'discord.js'
import { CommandHandler } from './CommandHandler.js'
import { ListenerHandler } from './ListenerHandler.js'

export class HieiClient extends Client {
  constructor ({ commands = './commands', listeners = './listeners', logger = null, options = {} }) {
    super(options)

    this.commandHandler = new CommandHandler(this, commands)
    this.listenerHandler = new ListenerHandler(this, listeners)

    // allow developers to attach a logger to the client without extending it
    this.log = logger
  }
}
