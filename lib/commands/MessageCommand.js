class MessageCommand {
  /** An application command invoked directly on a message from the context menu.
   * @param {string} name - The name of this message command. (1-32 characters)
   * @param {boolean} defaultPermission - Whether the command is enabled by default when registered.
   * @param {Array} permissions - Permission overrides for this slash command, if any. (optional)
   */
  constructor ({ name, description = '', defaultPermission, permissions = [], options = [] } = {}) {
    this.name = name
    this.description = description
    this.defaultPermission = defaultPermission
    this.permissions = permissions
    this.options = options
    this.type = 'MESSAGE'
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default MessageCommand
