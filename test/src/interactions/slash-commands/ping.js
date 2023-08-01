import { SlashCommand } from '../../../../src/hiei.js'

export default class Ping extends SlashCommand {
  constructor () {
    super({
      name: 'ping',
      description: 'Play ping pong with the bot',
      defaultPermission: true
    })
  }

  async run (interaction) {
    await interaction.reply({ content: ':ping_pong: Pong!' })
  }
}
