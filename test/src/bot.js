import { Client, GatewayIntentBits } from 'discord.js'
import { createInteractionHandler } from '../../src/hiei.js'

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

client.login(process.env.TOKEN)
