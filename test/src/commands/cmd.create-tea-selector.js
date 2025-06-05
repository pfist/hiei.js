import { ActionRowBuilder, ContainerBuilder, MessageFlags, PermissionFlagsBits, TextDisplayBuilder } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'tea',
  description: 'Create a tea selector',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
  async execute ({ interaction, components }) {
    const selector = components.get('select:tea-selector').data
    const button = components.get('button:submit-feedback').data
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('# Choose your favorite tea')
          )
          .addActionRowComponents(
            new ActionRowBuilder()
              .addComponents(selector)
          )
          .addActionRowComponents(
            new ActionRowBuilder()
              .addComponents(button)
          )
      ]
    })
  }
}
