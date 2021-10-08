import { SlashCommand } from '../../../hiei.js'

class Ping extends SlashCommand {
  constructor () {
    super({
      name: 'ping',
      description: 'Ping the bot',
      defaultPermission: false,
      permissions: [
        {
          id: '84183781501571072',
          type: 'USER',
          permission: true
        }
      ]
    })
  }

  async run (interaction) {
    await interaction.reply({ content: ':ping_pong: Pong!' })
  }
}

export default Ping
