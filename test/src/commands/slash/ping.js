import { SlashCommand } from '../../../../hiei.js'
import { ApplicationCommandPermissionType } from 'discord.js'

class Ping extends SlashCommand {
  constructor () {
    super({
      name: 'ping',
      description: 'Play ping pong with the bot',
      defaultPermission: false,
      permissions: [
        {
          id: '84183781501571072',
          type: ApplicationCommandPermissionType.User,
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
