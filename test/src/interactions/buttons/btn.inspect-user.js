import { time } from '@discordjs/builders'
import { MessageFlags } from 'discord.js'

export default {
  interaction: 'button',
  id: 'inspect-user',
  async execute (interaction) {
    const id = interaction.customId.split(':')[1]
    const member = await interaction.guild.members.fetch(id)
    const joinedServer = `${time(member.joinedAt)} • ${time(member.joinedAt, 'R')}`

    await interaction.reply({
      content: `User ${member.displayName} joined the server on ${joinedServer}`,
      flags: MessageFlags.Ephemeral
    })
  }
}
