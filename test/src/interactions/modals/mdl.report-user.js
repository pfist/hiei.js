import { MessageFlags } from 'discord.js'

export default {
  interaction: 'modal',
  id: 'report-user',
  async execute (interaction) {
    const reason = interaction.fields.getRadioGroup('report-user-reason')
    const note = interaction.fields.getTextInputValue('report-user-note')

    await interaction.reply({
      content: `You reported a user successfully. Reason given: ${reason}\nNotes: ${note}`,
      flags: MessageFlags.Ephemeral
    })
  }
}
