import { SlashCommand } from '../../hiei.js'

class Version extends SlashCommand {
  constructor () {
    super({
      name: 'version',
      description: 'Get the bot\'s version number'
    })
  }

  async run (interaction) {
    await interaction.reply('This will display the version number')
  }
}

export default Version
