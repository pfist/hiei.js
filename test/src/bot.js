import { Client, GatewayIntentBits } from 'discord.js'
import { createEventHandler, createInteractionHandler } from '../../src/hiei.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
})

createInteractionHandler(client, {
  commandsDirectory: './test/src/interactions/commands',
  buttonsDirectory: './test/src/interactions/buttons',
  modalsDirectory: './test/src/interactions/modals',
  selectsDirectory: './test/src/interactions/selects'
})

createEventHandler(client, {
  eventsDirectory: './test/src/events'
})

client.login(process.env.TOKEN)
