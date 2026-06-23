import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'echo',
  description: 'Test command for strings',
  options: [
    {
      type: 'string',
      name: 'free',
      description: 'A freeform string option',
      required: true
    },
    {
      type: 'string',
      name: 'strict',
      description: 'A string option that must be between 5-20 characters',
      required: true,
      min: 5,
      max: 20
    },
    {
      type: 'string',
      name: 'personality',
      description: 'A string option limited by choices',
      required: true,
      autocomplete: true
      // choices: [
      //   { name: 'Friendly', value: 'Greetings, human! I have prepared your strings with the utmost care. Enjoy!' },
      //   { name: 'Neutral', value: 'Here are your strings.' },
      //   { name: 'Aggressive', value: 'Here. Take your dumb strings. Now leave me alone.' },
      //   { name: 'Killer Instinct', value: 'KILL ALL HUMANS' }
      // ]
    }
  ],
  permissions: PermissionFlagsBits.SendMessages,
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused()
    const choices = [
      { name: 'Friendly', value: 'Greetings, human! I have prepared your strings with the utmost care. Enjoy!' },
      { name: 'Neutral', value: 'Here are your strings.' },
      { name: 'Aggressive', value: 'Here. Take your dumb strings. Now leave me alone.' },
      { name: 'Killer Instinct', value: 'KILL ALL HUMANS' }
    ]

    const filtered = choices.filter((choice) => choice.name.toLowerCase().startsWith(focusedValue))
    return filtered.map((choice) => ({ name: choice.name, value: choice.value }))
  },
  async execute({ interaction }) {
    const free = interaction.options.getString('free')
    const strict = interaction.options.getString('strict')
    const personality = interaction.options.getString('personality')

    await interaction.reply({
      content: `${personality}\nFree: ${free}\nStrict: ${strict}`,
      flags: MessageFlags.Ephemeral
    })
  }
}
