import { HieiClient } from '../hiei.js'
import { GatewayIntentBits } from 'discord.js'

const client = new HieiClient({
  allowedMentions: [],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
})

client.login(process.env.TOKEN)
