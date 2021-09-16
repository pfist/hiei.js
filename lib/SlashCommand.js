class SlashCommand {
  constructor ({ name, description, permissions, options = [] } = {}) {
    this.name = name
    this.description = description
    this.permissions = permissions
    this.options = options
  }

  run (interaction) {
    throw new Error(`Error: Run method not implemented for ${this.name}`)
  }
}

export default SlashCommand
