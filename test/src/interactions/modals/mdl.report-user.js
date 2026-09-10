import { MessageFlags } from 'discord.js'

export default {
  interaction: 'modal',
  id: 'report-user',
  async execute (interaction) {
    const reason = interaction.fields.getRadioGroup('report-user-reason')
    const note = interaction.fields.getTextInputValue('report-user-note')
    const target = interaction.fields.getSelectedMembers('report-user-target').first()

    await interaction.reply({
      content: `You successfully reported user ${target.displayName} with ID ${target.id}. Reason given: ${reason}\nNotes: ${note}`,
      flags: MessageFlags.Ephemeral
    })
  }
}
