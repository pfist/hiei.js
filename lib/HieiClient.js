import { Client } from 'discord.js'
import CommandHandler from './commands/CommandHandler.js'
import { ListenerHandler } from './listeners/ListenerHandler.js'

class HieiClient extends Client {
  /** An extension of the discord.js client. Loads command and listener handlers but is otherwise unchanged.
   * @param {Object} options - The options you want to pass to discord.js.
   */
  constructor ({ options = {} }) {
    super(options)

    this.commandHandler = new CommandHandler(this, 'src/commands')
    this.listenerHandler = new ListenerHandler(this, 'src/listeners')
  }
}

export default HieiClient
