import { ApplicationCommandType } from 'discord.js'

class MessageCommand {
  /** An application command invoked directly on a message from the context menu.
   * @param {string} name - The name of this message command. (1-32 characters)
   * @param {string} defaultMemberPermissions - The default permissions represented as a bit set.
   * @param {boolean} dmPermission - Whether the command is available in DMs.
   */
  constructor ({ name, defaultMemberPermissions, dmPermission }) {
    this.type = ApplicationCommandType.Message
    this.name = name
    this.defaultMemberPermissions = defaultMemberPermissions ?? 0
    this.dmPermission = dmPermission ?? false
  }

  asPayload () {
    return {
      type: this.type,
      name: this.name,
      default_member_permissions: this.defaultMemberPermissions,
      dm_permission: this.dmPermission
    }
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default MessageCommand
