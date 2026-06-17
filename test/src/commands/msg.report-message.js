import { PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'message',
  name: 'Report Message',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
  async execute ({ interaction, message, components }) {
    const modal = components.get('modal:reportMessage').data
    await interaction.showModal(modal)
  }
}
