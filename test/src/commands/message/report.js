import { MessageCommand } from '../../../../hiei.js'
import {
  ActionRowBuilder,
  InteractionCollector,
  InteractionType,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js'
import { channelMention, userMention } from '@discordjs/builders'

class Report extends MessageCommand {
  constructor () {
    super({
      name: 'Report to Moderators',
      defaultMemberPermissions: PermissionFlagsBits.SendMessages
    })
  }

  async run (interaction, message) {
    const report = new ModalBuilder()
      .setCustomId('reportModal')
      .setTitle('Report to Moderators')

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Why are you reporting this content?')
      .setStyle(TextInputStyle.Paragraph)

    const firstRow = new ActionRowBuilder().addComponents(reasonInput)

    report.addComponents(firstRow)

    await interaction.showModal(report)

    const collector = new InteractionCollector(this.client, {
      channel: interaction.channel,
      guild: interaction.guild,
      interactionType: InteractionType.modalSubmit,
      max: 1
    })

    collector.on('collect', async i => {
      if (i.customId === 'reportModal') {
        const reporter = i.user
        const reportee = message.author
        const reportedContent = message.content
        const reason = i.fields.getTextInputValue('reason')
        const channel = interaction.guild.channels.cache.get('962215455840419870')
        const log = new EmbedBuilder().addFields(
          { name: 'Content', value: reportedContent },
          { name: 'Reason', value: reason }
        )

        await channel.send({ content: `${userMention(reporter.id)} reported a message from ${userMention(reportee.id)} in ${channelMention(message.channel.id)}.`, embeds: [log] })
        return i.reply({ content: 'Thanks for your report. Our moderators will review it as soon as possible.', ephemeral: true })
      }
    })
  }
}

export default Report
