import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'picknum',
  description: 'Test command for constrained numbers',
  options: [
    {
      type: 'number',
      name: 'num',
      description: 'Pick a number between 1 and 10',
      required: true,
      min: 0.1,
      max: 10.0
    }
  ],
  permissions: PermissionFlagsBits.SendMessages,
  async execute(interaction) {
    const num = interaction.options.getNumber('num')

    await interaction.reply({
      content: `You chose ${num}. A good floating point number.`,
      flags: MessageFlags.Ephemeral
    })
  }
}
