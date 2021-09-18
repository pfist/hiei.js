class MessageCommand {
  constructor ({ name, description = '', options = [] } = {}) {
    this.name = name
    this.description = description
    this.options = options
    this.type = 'MESSAGE'
  }

  run (interaction) {
    throw new Error(`Error: Run method not implemented for ${this.name}`)
  }
}

export default MessageCommand
