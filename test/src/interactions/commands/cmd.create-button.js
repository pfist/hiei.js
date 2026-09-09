import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'create-button',
  description: 'A test command for buttons',
  permissions: PermissionFlagsBits.SendMessages,
  async execute (interaction) {
    const content = `Username: ${interaction.user.username}\nID: ${interaction.user.id}`
    const id = content.match(/^ID:\s*(\d+)$/m)[1]
    const button = new ButtonBuilder()
      .setCustomId(`inspect-user:${id}`)
      .setLabel('Inspect User')
      .setStyle(ButtonStyle.Primary)

    const row = new ActionRowBuilder().addComponents(button)

    await interaction.reply({
      content,
      components: [row]
    })
  }
}
