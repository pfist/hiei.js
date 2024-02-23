import { ModalSubmission } from '../../../../src/hiei.js'

export default class FeedbackSubmission extends ModalSubmission {
  constructor () {
    super({ id: 'submitFeedback' })
  }

  async run (interaction) {
    return interaction.reply({ content: 'Thanks for sharing your feedback.', ephemeral: true })
  }
}
