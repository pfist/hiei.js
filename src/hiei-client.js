import path from 'node:path'
import { Client } from 'discord.js'
import { createInteractionHandler } from './handlers/interaction-handler.js'

export class HieiClient extends Client {
  /** An extension of the discord.js client. Loads command and listener handlers but is otherwise unchanged.
   * @param {Object} options - The options you want to pass to discord.js.
   */
  constructor (options = {}) {
    super(options)

    createInteractionHandler(this, {
      commandDirectory: './commands',
      componentDirectory: './components'
    })
  }
}
