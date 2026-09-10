import { MessageFlags } from "discord.js"

export default {
  interaction: 'select',
  id: 'select-kombucha',
  async execute (interaction) {
    const selection = interaction.values[0]

    await interaction.reply({
      content: `You selected ${selection} as your chosen kombucha. A fine choice.`,
      flags: MessageFlags.Ephemeral
    })
  }
}
