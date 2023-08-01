import { SlashCommand } from '../../../../src/hiei.js'
import ms from 'ms'
import { time } from '@discordjs/builders'

export default class Ping extends SlashCommand {
  constructor () {
    super({
      name: 'ping',
      description: 'Play ping pong with the bot',
      defaultPermission: true,
      cooldown: ms('1 minute')
    })
  }

  async onCooldown (interaction, cooldown, remaining) {
    return interaction.reply({ content: `Command is on cooldown. Expires in ${remaining}. Last used by ${cooldown.member.user.username} at ${time(new Date(cooldown.timestamp))}.`, ephemeral: true })
  }

  async run (interaction) {
    await interaction.reply({ content: ':ping_pong: Pong!' })
  }
}
