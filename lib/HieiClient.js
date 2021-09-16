import { Client } from 'discord.js'
import CommandHandler from './CommandHandler.js'
// import { ListenerHandler } from './ListenerHandler.js'
// import { MessageCommandHandler } from './MessageCommandHandler'
// import { SlashCommandHandler } from './CommandHandler'
// import { UserCommandHandler } from './UserCommandHandler'

class HieiClient extends Client {
  constructor ({
    commands = './commands',
    listeners = './listeners',
    // messageCommands = './commands/message',
    // slashCommands = './commands/slash',
    // userCommands = './commands/user',
    options = {}
  }) {
    super(options)

    this.commandHandler = new CommandHandler(this, commands)
    // this.listenerHandler = new ListenerHandler(this, listeners)
    // this.messageCommandHandler = new MessageCommandHandler(this, messageCommands)
    // this.slashCommandHandler = new SlashCommandHandler(this, slashCommands)
    // this.userCommandHandler = new UserCommandHandler(this, userCommands)
  }
}

export default HieiClient
