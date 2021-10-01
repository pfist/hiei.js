import { SlashCommand } from '../../../hiei.js'

class Ping extends SlashCommand {
  constructor () {
    super({
      name: 'ping',
      description: 'Ping the bot'
    })
  }

  async run (interaction) {
    await interaction.reply({ content: ':ping_pong: Pong!' })
  }
}

export default Ping
