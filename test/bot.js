import { HieiClient } from '../hiei.js'
import { Intents } from 'discord.js'

const client = new HieiClient({
  options: {
    allowedMentions: [],
    intents: [Intents.FLAGS.GUILDS]
  }
})

client.login(process.env.TOKEN)
