import HieiClient from '../hiei.js'

const client = new HieiClient({
  options: {
    allowedMentions: [],
    intents: []
  }
})

client.login(process.env.TOKEN)
