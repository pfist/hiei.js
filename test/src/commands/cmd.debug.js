import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'debug',
  description: 'A command for testing many command options',
  options: [
    {
      type: 'attachment',
      name: 'screenshot',
      description: 'An example attachment option',
      required: true
    }
  ],
  permissions: PermissionFlagsBits.SendMessages,
  async execute({ interaction }) {
    const screenshot = interaction.options.getAttachment('screenshot')
    await interaction.reply({
      content: `Here is ${screenshot.name} at \`${screenshot.url}\``,
      files: [screenshot],
      flags: MessageFlags.Ephemeral
    })
  }
}
