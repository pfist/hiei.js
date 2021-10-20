import { Client } from 'discord.js'
import CommandHandler from './commands/CommandHandler.js'
import { ListenerHandler } from './listeners/ListenerHandler.js'

class HieiClient extends Client {
  constructor ({
    commands = './commands',
    listeners = './listeners',
    options = {},
    debug = false
  }) {
    super(options)

    this.commandHandler = new CommandHandler(this, commands)
    this.listenerHandler = new ListenerHandler(this, listeners)
  }
}

export default HieiClient
