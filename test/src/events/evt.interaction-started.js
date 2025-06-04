export default {
  name: 'interaction:started',
  emitter: 'hiei',
  execute (interaction) {
    console.log(`[hiei:events] Interaction ${interaction.commandName} started.`)
  }
}
