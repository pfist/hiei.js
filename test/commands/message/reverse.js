import { MessageCommand } from '../../../hiei.js'

class Reverse extends MessageCommand {
  constructor () {
    super({
      name: 'reverse',
      defaultPermission: false,
      permissions: [
        {
          id: '893313652126519316',
          type: 'ROLE',
          permission: true
        }
      ]
    })
  }

  async run (interaction, message) {
    await interaction.reply({ content: message.content.split('').reverse().join(''), ephemeral: true })
  }
}

export default Reverse
