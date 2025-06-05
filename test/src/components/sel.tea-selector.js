export default {
  interaction: 'select',
  type: 'string',
  id: 'tea-selector',
  placeholder: 'Choose your preferred tea.',
  options: [
    {
      label: 'Chai tea',
      description: 'A robust black tea infused with cardamom, cinnamon, and clove.',
      value: 'chai',
      default: true,
      emoji: '🪷'
    },
    {
      label: 'Green tea',
      description: 'Light and grassy with a hint of astringency.',
      value: 'green',
      emoji: '🍃'
    },
    {
      label: 'Matcha',
      description: 'Stone-ground green tea powder whisked into a luminous froth.',
      value: 'matcha',
      emoji: '🍵'
    },
    {
      label: 'Thai tea',
      description: 'A vivid orange blend of black tea and spices, swirled with condensed milk.',
      value: 'thai',
      emoji: '🧡'
    },
    {
      label: 'Rooibos tea',
      description: 'Naturally caffeine-free with mellow notes of honey and vanilla.',
      value: 'rooibos',
      emoji: '🌙'
    }
  ],
  async execute ({ interaction }) {
    const value = interaction.values[0]
    const choice = this.options.find(option => option.value === value)
    interaction.reply({ content: `${choice.emoji} ${choice.label} - ${choice.description}` })
  }
}
