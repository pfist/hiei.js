import { ActionRowBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export default {
  interaction: 'slash',
  name: 'create-select',
  description: 'A command for testing select menus',
  permissions: PermissionFlagsBits.SendMessages,
  async execute (interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('select-kombucha')
      .setPlaceholder('Choose your favorite kombucha')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Brew Dr')
          .setDescription('Best variety of flavors, medium sweetness')
          .setValue('brew-dr'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Lionheart')
          .setDescription('Dry, minimal sweetness, expensive')
          .setValue('lionheart'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Humm')
          .setDescription('Limited selection of flavors, unique taste, sold in cans')
          .setValue('humm'),
        new StringSelectMenuOptionBuilder()
          .setLabel('GTS')
          .setDescription('Strong flavors, medium sweetness, highest carbonation, somewhat expensive')
          .setValue('gts')
      )

    const row = new ActionRowBuilder().addComponents(menu)

    await interaction.reply({
      components: [row]
    })
  }
}
