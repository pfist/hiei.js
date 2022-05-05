import { ApplicationCommandType } from 'discord.js'

class SlashCommand {
  /** An application command invoked by typing / in a text channel.
   * @param {string} name - The name of this slash command. (1-32 characters)
   * @param {string} description - The description of this slash command. (1-100 characters)
   * @param {boolean} defaultPermission - Whether this command is enabled for everyone by default.
   * @param {Array} options - Options for this command, if any.
   */
  constructor ({ name, description, defaultPermission, options }) {
    this.type = ApplicationCommandType.ChatInput
    this.name = name
    this.description = description ?? 'No description provided'
    this.options = options ?? []
    this.defaultPermission = defaultPermission ?? false
  }

  asPayload () {
    return {
      type: this.type,
      name: this.name,
      description: this.description,
      options: this.options.map(o => {
        if (!o.required && o.type !== 1) o.required = false
        return o
      }),
      defaultPermission: this.defaultPermission
    }
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default SlashCommand
