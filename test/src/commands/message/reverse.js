import { MessageCommand } from '../../../../hiei.js'
import { PermissionFlagsBits } from 'discord.js'

class Reverse extends MessageCommand {
  constructor () {
    super({
      name: 'reverse',
      defaultMemberPermissions: PermissionFlagsBits.SendMessages
    })
  }

  async run (interaction, message) {
    await interaction.reply({ content: message.content.split('').reverse().join(''), ephemeral: true })
  }
}

export default Reverse
