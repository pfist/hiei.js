import { Client } from 'discord.js'
import { InteractionHandler } from './interactions/interaction-handler.js'
import { ListenerHandler } from './listeners/listener-handler.js'

export class HieiClient extends Client {
  /** An extension of the discord.js client. Loads command and listener handlers but is otherwise unchanged.
   * @param {Object} options - The options you want to pass to discord.js.
   */
  constructor (options = {}) {
    super(options)

    this.interactionHandler = new InteractionHandler(this, 'src/interactions')
    this.listenerHandler = new ListenerHandler(this, 'src/listeners')
  }
}
