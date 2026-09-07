import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'mult',
  description: 'Test command for numbers',
  options: [
    {
      type: 'number',
      name: 'base',
      description: 'Any floating point number',
      required: true
    },
    {
      type: 'number',
      name: 'multiplier',
      description: 'Choose a multiplier',
      required: true,
      // autocomplete: true
      choices: [
        { name: '50%', value: 0.5 },
        { name: '100%', value: 1.0 },
        { name: '125%', value: 1.25 },
        { name: '150%', value: 1.5 },
        { name: '200%', value: 2.0 }
      ]
    }
  ],
  permissions: PermissionFlagsBits.SendMessages,
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused()
    const choices = [
      { name: '50%', value: 0.5 },
      { name: '100%', value: 1.0 },
      { name: '125%', value: 1.25 },
      { name: '150%', value: 1.5 },
      { name: '200%', value: 2.0 }
    ]

    const filtered = choices.filter((choice) => choice.name.toLowerCase().startsWith(focusedValue))
    return filtered.map((choice) => ({ name: choice.name, value: choice.value }))
  },
  async execute(interaction) {
    const base = interaction.options.getNumber('base')
    const multiplier = interaction.options.getNumber('multiplier')

    await interaction.reply({
      content: `${base} x ${multiplier} = ${base * multiplier}`,
      flags: MessageFlags.Ephemeral
    })
  }
}
