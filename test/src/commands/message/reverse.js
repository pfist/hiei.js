import { MessageCommand } from '../../../../hiei.js'
import { ApplicationCommandPermissionType } from 'discord.js'

class Reverse extends MessageCommand {
  constructor () {
    super({
      name: 'reverse',
      defaultPermission: false,
      permissions: [
        {
          id: '893313652126519316',
          type: ApplicationCommandPermissionType.Role,
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
