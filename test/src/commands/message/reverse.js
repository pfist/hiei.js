import { MessageCommand } from '../../../../hiei.js'

class Reverse extends MessageCommand {
  constructor () {
    super({
      name: 'reverse'
    })
  }

  async run (interaction, message) {
    await interaction.reply({ content: message.content.split('').reverse().join(''), ephemeral: true })
  }
}

export default Reverse
