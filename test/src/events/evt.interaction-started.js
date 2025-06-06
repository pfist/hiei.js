export default {
  event: 'interaction:started',
  emitter: 'hiei',
  execute (interaction) {
    console.log(`[hiei:events] Interaction ${interaction.commandName || interaction.customId} started.`)
  }
}
