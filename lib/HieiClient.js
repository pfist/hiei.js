import { Client } from 'discord.js'
import CommandHandler from './commands/CommandHandler.js'
import { ListenerHandler } from './listeners/ListenerHandler.js'

class HieiClient extends Client {
  constructor ({ options = {} }) {
    super(options)

    this.commandHandler = new CommandHandler(this, 'src/commands')
    this.listenerHandler = new ListenerHandler(this, 'src/listeners')
  }
}

export default HieiClient
