export default {
  interaction: 'button',
  id: 'feedbackButton',
  label: 'Submit Feedback',
  style: 'Primary',
  async execute (interaction) {
    await interaction.reply({ content: 'Thanks for pitching in.' })
  }
}
