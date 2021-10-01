import { SlashCommand } from '../../../hiei.js'
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'

class BanUser extends SlashCommand {
  constructor () {
    super({
      name: 'ban',
      description: 'Ban a user from the server',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'The user you want to ban',
          required: true
        },
        {
          type: 'STRING',
          name: 'reason',
          description: 'The reason you are banning this user',
          required: true
        }
      ]
    })
  }

  async run (interaction) {
    const oUser = interaction.options.getUser('user')
    const oReason = interaction.options.getString('reason')
    const BanButton = new MessageButton()
      .setCustomId('ban')
      .setLabel('Ban User')
      .setStyle('DANGER')

    const CancelButton = new MessageButton()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle('SECONDARY')

    const actions = new MessageActionRow()
      .addComponents(
        [CancelButton, BanButton]
      )

    const banInfo = new MessageEmbed()
      .setTitle(oUser.tag)
      .setDescription(`Reason: ${oReason}`)
      .setThumbnail(oUser.displayAvatarURL())

    await interaction.reply({ content: `Are you sure you want to ban ${oUser}?`, components: [actions], embeds: [banInfo], ephemeral: true })

    const filter = i => i.customId === 'ban' && i.user.id === interaction.user.id
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 10000 })

    collector.on('collect', async i => {
      await i.deferUpdate()

      BanButton.setDisabled(true)
      CancelButton.setDisabled(true)

      const actionsDisabled = new MessageActionRow()
        .addComponents(
          [CancelButton, BanButton]
        )

      await i.editReply({ content: `Are you sure you want to ban ${oUser}?`, components: [actionsDisabled], embeds: [banInfo], ephemeral: true })
      await i.channel.send({ content: `:no_entry: ${oUser} **was banned from the server**` })
    })

    collector.on('end', collected => 'Time ran out!')
  }
}

export default BanUser
