import { PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'message',
  name: 'Report Message',
  permissions: PermissionFlagsBits.SendMessages,
  async execute (interaction, message) {
    interaction.reply({ content: `Reported message: ${message.content}` })
  }
}
