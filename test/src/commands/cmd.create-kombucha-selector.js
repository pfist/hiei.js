import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  MessageFlags,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder
} from 'discord.js'

export default {
  interaction: 'slash',
  name: 'kombucha',
  description: 'Create a kombucha selector',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
  async execute ({ interaction, components }) {
    const selector = new StringSelectMenuBuilder()
      .setCustomId('kombucha-selector')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Lemon Ginger')
          .setValue('lemon-ginger'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Blackberry Trails')
          .setValue('blackberry-trails'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Superberry')
          .setValue('superberry')
      )

    const button = new ButtonBuilder()
      .setStyle('Primary')
      .setLabel('Choose for me')
      .setCustomId('choose-random-kombucha')

    const response = await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('# Choose your favorite kombucha')
          )
          .addActionRowComponents(
            new ActionRowBuilder()
              .addComponents(selector)
          )
          .addActionRowComponents(
            new ActionRowBuilder()
              .addComponents(button)
          )
      ],
      withResponse: true
    })

    const collector = response.resource.message.createMessageComponentCollector({ time: 60_000 })
    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'This is not for you!', flags: MessageFlags.Ephemeral })
      }

      if (i.isStringSelectMenu() && i.customId === 'kombucha-selector') {
        const value = i.values[0]
        const label = selector.options.find(opt => opt.value === value)?.label || value
        await i.reply({ content: `You selected **${label}**`, flags: MessageFlags.Ephemeral })
      }

      if (i.isButton() && i.customId === 'choose-random-kombucha') {
        const kombuchas = [
          'Lemon Ginger',
          'Blackberry Trails',
          'Superberry'
        ]
        const random = kombuchas[Math.floor(Math.random() * kombuchas.length)]
        await i.reply({ content: `Random pick: **${random}**!`, flags: MessageFlags.Ephemeral })
      }
    })
  }
}
