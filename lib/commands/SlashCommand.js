import HieiError from '../HieiError.js'

class SlashCommand {
  constructor ({ name, description, defaultPermission, permissions = [], options = [] } = {}) {
    this.name = name
    this.description = description
    this.defaultPermission = defaultPermission
    this.permissions = permissions
    this.options = options
    this.type = 'CHAT_INPUT'
  }

  run () {
    throw new HieiError('NOT_IMPLEMENTED', this.constructor.name, 'run')
  }
}

export default SlashCommand
