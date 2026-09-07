import { PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'user',
  name: 'Get Info',
  permissions: PermissionFlagsBits.SendMessages,
  execute (interaction, user) {
    return interaction.reply({ content: `User: ${user.username}, ID: ${user.id}` })
  }
}
