class MessageCommand {
  constructor ({ name, description = '', defaultPermission, permissions = [], options = [] } = {}) {
    this.name = name
    this.description = description
    this.defaultPermission = defaultPermission
    this.permissions = permissions
    this.options = options
    this.type = 'MESSAGE'
  }

  run (interaction) {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default MessageCommand
