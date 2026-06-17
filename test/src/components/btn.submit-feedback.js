import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

export default {
  interaction: 'button',
  id: 'submit-feedback',
  label: 'Submit Feedback',
  style: 'Primary',
  async execute ({ interaction }) {
    const form = new ModalBuilder()
      .setCustomId('feedback-form')
      .setTitle('Feedback Submission Form')

    const feedback = new TextInputBuilder()
      .setCustomId('feedback-input')
      .setLabel('Let us know how we are doing!')
      .setStyle(TextInputStyle.Paragraph)

    const row = new ActionRowBuilder().addComponents(feedback)
    form.addComponents(row)

    await interaction.showModal(form)

    try {
      const submitted = await interaction.awaitModalSubmit({
        filter: i => i.customId === 'feedback-form' && i.user.id === interaction.user.id,
        time: 60_000
      })
      const feedbackValue = submitted.fields.getTextInputValue('feedback-input')
      await submitted.reply({ content: `Thank you for your feedback!\n\n"${feedbackValue}"`, ephemeral: true })
    } catch (error) {
      console.log('Looks like your modal is broken. Pity.')
    }
  }
}
