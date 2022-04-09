import { SlashCommand } from '../../../../hiei.js'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

class Job extends SlashCommand {
  constructor () {
    super({
      name: 'job',
      description: 'Post a salary job on our job board',
      defaultPermission: true
    })
  }

  async run (interaction) {
    const questions = new ModalBuilder()
      .setCustomId('jobModal')
      .setTitle('Post a Salary Job')

    const roleInput = new TextInputBuilder()
      .setCustomId('role')
      .setLabel('Role & company')
      .setStyle(TextInputStyle.Short)

    const locationInput = new TextInputBuilder()
      .setCustomId('location')
      .setLabel('Location')
      .setStyle(TextInputStyle.Short)

    const responsibilitiesInput = new TextInputBuilder()
      .setCustomId('responsibilities')
      .setLabel('Responsibilities')
      .setStyle(TextInputStyle.Paragraph)

    const qualificationsInput = new TextInputBuilder()
      .setCustomId('qualifications')
      .setLabel('Qualifications')
      .setStyle(TextInputStyle.Paragraph)

    const applyInput = new TextInputBuilder()
      .setCustomId('apply')
      .setLabel('How to apply')
      .setStyle(TextInputStyle.Short)

    const firstRow = new ActionRowBuilder().addComponents(roleInput)
    const secondRow = new ActionRowBuilder().addComponents(locationInput)
    const thirdRow = new ActionRowBuilder().addComponents(responsibilitiesInput)
    const fourthRow = new ActionRowBuilder().addComponents(qualificationsInput)
    const fifthRow = new ActionRowBuilder().addComponents(applyInput)

    questions.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow)

    await interaction.showModal(questions)
  }
}

export default Job
