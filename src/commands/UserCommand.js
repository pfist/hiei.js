import { ApplicationCommandType } from 'discord.js'

class UserCommand {
  /** An application command invoked directly on a user from the context menu.
   * @param {string} name - The name of this user command. (1-32 characters)
   * @param {boolean} defaultPermission - Whether this command is enabled for everyone by default.
   */
  constructor ({ name, defaultPermission }) {
    this.type = ApplicationCommandType.User
    this.name = name
    this.defaultPermission = defaultPermission ?? false
  }

  asPayload () {
    return {
      type: this.type,
      name: this.name,
      description: '',
      defaultPermission: this.defaultPermission
    }
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default UserCommand
