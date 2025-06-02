import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'ping',
  description: 'Play ping pong with the bot',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
  async execute ({ interaction }) {
    await interaction.reply({ content: ':ping_pong: Pong!', flags: MessageFlags.Ephemeral })
  }
}
