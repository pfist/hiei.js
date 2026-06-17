import { MessageFlags } from 'discord.js'

export default {
  interaction: 'modal',
  id: 'reportMessage',
  title: 'Report Message',
  fields: [
    {
      id: 'reason',
      label: 'Why are you reporting this message?',
      style: 'Paragraph'
    }
  ],
  execute ({ interaction }) {
    return interaction.reply({ content: 'Thank you for your report', flags: MessageFlags.Ephemeral })
  }
}
