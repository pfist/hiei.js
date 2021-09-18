import HieiError from '../HieiError.js'

class SlashCommand {
  constructor ({ name, description, permissions, options = [] } = {}) {
    this.name = name
    this.description = description
    this.permissions = permissions
    this.options = options
    this.type = 'CHAT_INPUT'
  }

  run () {
    throw new HieiError('NOT_IMPLEMENTED', this.constructor.name, 'run')
  }
}

export default SlashCommand
