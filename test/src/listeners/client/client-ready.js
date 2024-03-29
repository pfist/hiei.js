import { Listener } from '../../../../src/hiei.js'
import { ActivityType } from 'discord.js'

class ClientReady extends Listener {
  constructor () {
    super({
      name: 'ClientReady',
      emitter: 'client',
      event: 'ready',
      once: true
    })
  }

  run () {
    this.client.guilds.cache.each(guild => {
      console.log(`${this.client.user.tag} connected to ${guild.name}`)
      this.client.user.setActivity('the wind', { type: ActivityType.Watching })
    })
  }
}

export default ClientReady
