import { Client, GatewayIntentBits } from 'discord.js'
import { createInteractionHandler, createEventHandler } from '../../src/hiei.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
})

createInteractionHandler(client, {
  commandDirectory: './test/src/commands',
  componentDirectory: './test/src/components'
})

createEventHandler(client, {
  eventDirectory: './test/src/events'
})

client.login(process.env.TOKEN)
