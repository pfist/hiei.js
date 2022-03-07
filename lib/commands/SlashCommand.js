class SlashCommand {
  /** An application command invoked by typing / in a text channel.
   * @param {string} name - The name of this slash command. (1-32 characters)
   * @param {string} description - The description of this slash command. (1-100 characters)
   * @param {boolean} defaultPermission - Whether the command is enabled by default when registered.
   * @param {Array} permissions - Permission overrides for this slash command, if any. (optional)
   * @param {Array} options - Arguments for this command, if any. (optional)
   */
  constructor ({ name, description = '', defaultPermission, permissions = [], options = [] } = {}) {
    this.name = name
    this.description = description
    this.defaultPermission = defaultPermission
    this.permissions = permissions
    this.options = options
    this.type = 'CHAT_INPUT'
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default SlashCommand
