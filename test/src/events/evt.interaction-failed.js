export default {
  event: 'interaction:failed',
  emitter: 'hiei',
  execute ({ interaction }) {
    console.log(`[hiei:events] Interaction ${interaction.commandName} failed.`)
  }
}
