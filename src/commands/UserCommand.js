import { ApplicationCommandType } from 'discord.js'

class UserCommand {
  /** An application command invoked directly on a user from the context menu.
   * @param {string} name - The name of this command. (1-32 characters)
   * @param {PermissionResolvable} defaultMemberPermissions - The default permissions required to use this command.
   */
  constructor ({ name, defaultMemberPermissions }) {
    this.type = ApplicationCommandType.User
    this.name = name
    this.defaultMemberPermissions = defaultMemberPermissions ?? null
  }

  asPayload () {
    return {
      type: this.type,
      name: this.name,
      description: '',
      options: [],
      defaultMemberPermissions: this.defaultMemberPermissions.toString()
    }
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default UserCommand
