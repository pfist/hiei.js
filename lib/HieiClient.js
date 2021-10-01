import { Client } from 'discord.js'
import CommandHandler from './commands/CommandHandler.js'
import ComponentHandler from './components/ComponentHandler.js'
import ListenerHandler from './listeners/ListenerHandler.js'

class HieiClient extends Client {
  constructor ({
    commands = './commands',
    components = './components',
    listeners = './listeners',
    options = {}
  }) {
    super(options)

    this.commandHandler = new CommandHandler(this, commands)
    this.componentHandler = new ComponentHandler(this, components)
    this.listenerHandler = new ListenerHandler(this, listeners)
  }
}

export default HieiClient
