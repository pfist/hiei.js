export default {
  event: 'clientReady',
  emitter: 'client',
  once: true,
  execute (client) {
    client.guilds.cache.each(guild => {
      console.log(`[client:events] ${client.user.tag} successfully connected to ${guild.name} and is ready to use`)
    })
  }
}
