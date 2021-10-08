class UserCommand {
  constructor ({ name, description = '', defaultPermission, permissions = [], options = [] } = {}) {
    this.name = name
    this.description = description
    this.defaultPermission = defaultPermission
    this.permissions = permissions
    this.options = options
    this.type = 'USER'
  }

  run (interaction) {
    throw new Error(`Error: Run method not implemented for ${this.name}`)
  }
}

export default UserCommand
