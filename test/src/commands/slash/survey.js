import { SlashCommand } from '../../../../hiei.js'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

class Survey extends SlashCommand {
  constructor () {
    super({
      name: 'survey',
      description: 'Create a modal survey',
      defaultPermission: true
    })
  }

  async run (interaction) {
    const questions = new ModalBuilder()
      .setCustomId('surveyModal')
      .setTitle('Test Survey')

    const favoriteColorInput = new TextInputBuilder()
      .setCustomId('favoriteColorInput')
      .setLabel('What is your favorite color?')
      .setStyle(TextInputStyle.Short)

    const hobbiesInput = new TextInputBuilder()
      .setCustomId('hobbiesInput')
      .setLabel('What are some of your favorite hobbies?')
      .setStyle(TextInputStyle.Paragraph)

    const firstRow = new ActionRowBuilder().addComponents(favoriteColorInput)
    const secondRow = new ActionRowBuilder().addComponents(hobbiesInput)

    questions.addComponents(firstRow, secondRow)

    await interaction.showModal(questions)
  }
}

export default Survey
