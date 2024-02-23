import { SlashCommand } from 'hiei.js'
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js'

class AddFeedbackButton extends SlashCommand {
  constructor () {
    super({
      name: 'feedback',
      description: 'Add a button to the specified channel that allows users to submit feedback.',
      options: [
        {
          type: ApplicationCommandOptionType.Channel,
          name: 'channel',
          description: 'The channel the button should be added to.',
          required: true
        }
      ],
      defaultMemberPermissions: PermissionFlagsBits.ManageGuild
    })
  }

  async run (interaction) {
    try {
      const channel = interaction.options.getChannel('channel')
      const button = new ButtonBuilder()
        .setCustomId('feedbackButton')
        .setLabel('Submit Feedback')
        .setStyle(ButtonStyle.Primary)

      const row = new ActionRowBuilder()
        .addComponents(button)

      const message = await channel.send({ components: [row] })
      return interaction.reply({ content: `Feedback button added. ${message.url}`, ephemeral: true })
    } catch (error) {
      console.error({ error })
      return interaction.reply({ content: 'Failed to add feedback button.' })
    }
  }
}

export default AddFeedbackButton
