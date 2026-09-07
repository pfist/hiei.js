import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'pickint',
  description: 'Test command for constrained integers',
  options: [
    {
      type: 'integer',
      name: 'int',
      description: 'Pick a number between 1 and 10',
      required: true,
      min: 1,
      max: 10
    }
  ],
  permissions: PermissionFlagsBits.SendMessages,
  async execute(interaction) {
    const int = interaction.options.getInteger('int')

    await interaction.reply({
      content: `You chose ${int}. A good number.`,
      flags: MessageFlags.Ephemeral
    })
  }
}
