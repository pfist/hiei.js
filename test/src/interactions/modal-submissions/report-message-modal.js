import { ModalSubmission } from '../../../../src/hiei.js'

export default class ReportMessageModal extends ModalSubmission {
  constructor () {
    super({ id: 'reportMessage' })
  }

  async run (interaction) {
    return interaction.reply({ content: 'Thanks for your report.', ephemeral: true })
  }
}
