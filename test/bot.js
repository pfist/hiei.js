import HieiClient from '../hiei.js'
import Signale from 'signale'

const client = new HieiClient({
  commands: './commands',
  listeners: './listeners',
  logger: new Signale(),
  options: {
    allowedMentions: [],
    intents: []
  }
})

client.login(process.env.TOKEN)
