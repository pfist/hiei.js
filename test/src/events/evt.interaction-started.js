export default {
  name: 'interactionStarted',
  emitter: 'hiei',
  execute (interaction) {
    console.log(`[hiei:events] Interaction ${interaction.commandName} started in #${interaction.channel.name} by ${interaction.user.username} (${interaction.user.id}).`)
  }
}
