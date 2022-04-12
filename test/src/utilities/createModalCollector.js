import { InteractionCollector, InteractionType } from 'discord.js'

export default function createModalCollector (client, interaction) {
  return new InteractionCollector(client, {
    channel: interaction.channel,
    guild: interaction.guild,
    interactionType: InteractionType.modalSubmit,
    max: 1
  })
}
