import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'level',
  description: 'Test command for integers',
  options: [
    {
      type: 'integer',
      name: 'level',
      description: 'An integer option limited by choices',
      required: true,
      autocomplete: true
      // choices: [
      //   { name: 'Novice', value: 1 },
      //   { name: 'Intermedia', value: 2 },
      //   { name: 'Advanced', value: 3 },
      //   { name: 'Master', value: 4 }
      // ]
    }
  ],
  permissions: PermissionFlagsBits.SendMessages,
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused()
    const choices = [
      { name: 'Novice', value: 1 },
      { name: 'Intermediate', value: 2 },
      { name: 'Advanced', value: 3 },
      { name: 'Master', value: 4 }
    ]

    const filtered = choices.filter((choice) => choice.name.toLowerCase().startsWith(focusedValue))
    return filtered.map((choice) => ({ name: choice.name, value: choice.value }))
  },
  async execute({ interaction }) {
    const level = interaction.options.getInteger('level')

    await interaction.reply({
      content: `You reached level ${level}!`,
      flags: MessageFlags.Ephemeral
    })
  }
}
