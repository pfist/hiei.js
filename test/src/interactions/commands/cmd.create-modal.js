import { LabelBuilder, ModalBuilder, PermissionFlagsBits, TextDisplayBuilder, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder } from "discord.js"

export default {
  interaction: 'slash',
  name: 'create-modal',
  description: 'A command for testing modals',
  permissions: PermissionFlagsBits.SendMessages,
  async execute (interaction) {
    const modal = new ModalBuilder()
      .setCustomId('report-user')
      .setTitle('Report User')


    // text display
    const preamble = new TextDisplayBuilder().setContent(
      'You are about to report a user to the moderation team. Please review your report carefully.'
    )

    // radio group
    const reason = new LabelBuilder().setLabel('Reason for Reporting').setRadioGroupComponent(radios =>
      radios.setCustomId('report-user-reason').addOptions([
        { label: 'Spam', value: 'spam', description: 'Repeated messages or other suspicious content', default: true },
        { label: 'Harassment', value: 'harassment', description: 'Targeting another user' },
        { label: 'Ban Evasion', value: 'evasion', description: 'Suspected alt account for a previously banned user' }
      ])
    )

    // text input
    const noteInput = new TextInputBuilder()
      .setCustomId('report-user-note')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('This is only visible to moderators and will not be shown to the reported user.')

    const noteLabel = new LabelBuilder()
      .setLabel('Notes')
      .setDescription('Add any additional context that may help the moderation team.')
      .setTextInputComponent(noteInput)

    // select menu
    const userInput = new UserSelectMenuBuilder()
      .setCustomId('report-user-target')
      .setPlaceholder('Select a user')

    const userLabel = new LabelBuilder()
      .setLabel('User')
      .setDescription('The user you would like to report.')
      .setUserSelectMenuComponent(userInput)

    modal
      .addTextDisplayComponents(preamble)
      .addLabelComponents(userLabel, reason, noteLabel)

    await interaction.showModal(modal)
  }
}
