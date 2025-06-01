import { ActionRowBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js'

export default {
  interaction: 'message',
  name: 'Report Message',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
  async execute (interaction, message) {
    const report = new ModalBuilder()
      .setCustomId('reportMessage')
      .setTitle('Report Message')

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Why are you reporting this message?')
      .setStyle(TextInputStyle.Paragraph)

    const firstRow = new ActionRowBuilder().addComponents(reasonInput)

    report.addComponents(firstRow)

    await interaction.showModal(report)
  }
}
