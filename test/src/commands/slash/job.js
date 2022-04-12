import { SlashCommand } from '../../../../hiei.js'
import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { channelMention } from '@discordjs/builders'
import createModalCollector from '../../utilities/createModalCollector.js'

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
      .setPlaceholder('Technical Artist at Acme Games')
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

    const collector = createModalCollector(this.client, interaction)

    collector.on('collect', async i => {
      if (i.customId === 'jobModal') {
        const submitter = i.user
        const role = i.fields.getTextInputValue('role')
        const location = i.fields.getTextInputValue('location')
        const responsibilities = i.fields.getTextInputValue('responsibilities')
        const qualificiations = i.fields.getTextInputValue('qualifications')
        const apply = i.fields.getTextInputValue('apply')
        const channel = i.guild.channels.cache.get('962242384807227464')
        const jobPost = new EmbedBuilder()
          .setTitle(role)
          .addFields(
            { name: 'Location', value: location },
            { name: 'Responsibilities', value: responsibilities },
            { name: 'Qualifications', value: qualificiations },
            { name: 'How to Apply', value: apply }
          )
          .setTimestamp()

        await channel.send({ content: `Posted by <@${submitter.id}>`, embeds: [jobPost] })
        return i.reply({ content: `Your job opportunity was successfully submitted to ${channelMention('962242384807227464')}`, ephemeral: true })
      }
    })
  }
}

export default Job
