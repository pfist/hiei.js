import { Client } from 'discord.js'
import { ListenerHandler } from './ListenerHandler'
import { MessageCommandHandler } from './MessageCommandHandler'
import { SlashCommandHandler } from './SlashCommandHandler'
import { UserCommandHandler } from './UserCommandHandler'

export class HieiClient extends Client {
  constructor ({
    listeners = './listeners',
    messageCommands = './commands/message',
    slashCommands = './commands/slash',
    userCommands = './commands/user',
    options = {}
  }) {
    super(options)

    this.listenerHandler = new ListenerHandler(this, listeners)
    this.messageCommandHandler = new MessageCommandHandler(this, messageCommands)
    this.slashCommandHandler = new SlashCommandHandler(this, slashCommands)
    this.userCommandHandler = new UserCommandHandler(this, userCommands)
  }
}
