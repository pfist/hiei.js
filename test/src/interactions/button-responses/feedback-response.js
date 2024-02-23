import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { ButtonResponse } from '../../../../src/hiei.js'

export default class FeedbackButtonResponse extends ButtonResponse {
  constructor () {
    super({ id: 'feedbackButton' })
  }

  async run (interaction) {
    const feedbackModal = new ModalBuilder()
      .setCustomId('submitFeedback')
      .setTitle('Submit Feedback')

    const feedbackInput = new TextInputBuilder()
      .setCustomId('feedback')
      .setLabel('How can we improve?')
      .setStyle(TextInputStyle.Paragraph)

    const firstRow = new ActionRowBuilder().addComponents(feedbackInput)

    feedbackModal.addComponents(firstRow)

    await interaction.showModal(feedbackModal)
  }
}
