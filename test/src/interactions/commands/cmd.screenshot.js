import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'screen',
  description: 'Test command for attachment, boolean',
  options: [
    {
      type: 'attachment',
      name: 'screenshot',
      description: 'An example attachment option',
      required: true
    },
    {
      type: 'boolean',
  		name: 'spoiler',
  		description: 'An example boolean option',
  		required: true
    }
  ],
  permissions: PermissionFlagsBits.BanMembers,
  async execute(interaction) {
    const screenshot = interaction.options.getAttachment('screenshot')
    const spoiler = interaction.options.getBoolean('spoiler')

    await interaction.reply({
      content: `${screenshot.name} uploaded successfully. ${spoiler ? 'DO NOT SHARE' : 'Nice.'}`,
      files: [screenshot],
      flags: MessageFlags.Ephemeral
    })
  }
}
