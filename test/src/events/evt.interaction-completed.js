export default {
  event: 'interaction:completed',
  emitter: 'hiei',
  execute (interaction) {
    const start = interaction.createdAt
    const end = Date.now()
    const elapsedMilliseconds = end - start
    const elapsedSeconds = (elapsedMilliseconds / 1000).toFixed(2)
    console.log(`[hiei:events] Interaction ${interaction.commandName} completed successfully in ${elapsedSeconds}s.`)
  }
}
