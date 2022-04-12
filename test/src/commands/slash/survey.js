import { SlashCommand } from '../../../../hiei.js'
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { channelMention } from '@discordjs/builders'
import createModalCollector from '../../utilities/createModalCollector.js'

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

    const collector = createModalCollector(this.client, interaction)

    collector.on('collect', async i => {
      if (i.customId === 'surveyModal') {
        const submitter = i.user
        const color = i.fields.getTextInputValue('favoriteColorInput')
        const hobbies = i.fields.getTextInputValue('hobbiesInput')
        const channel = i.guild.channels.cache.get('962215455840419870')

        await channel.send({ content: `Survey submitted by ${submitter}:\nFavorite color: ${color}\nHobbies: ${hobbies}` })
        return i.reply({ content: `Your response was submitted to ${channelMention('962215455840419870')}`, ephemeral: true })
      }
    })
  }
}

export default Survey
