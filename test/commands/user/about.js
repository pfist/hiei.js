import { UserCommand } from '../../../hiei.js'

class About extends UserCommand {
  constructor () {
    super({
      name: 'about'
    })
  }

  async run (interaction, user) {
    await interaction.reply({ content: `**Username:** ${user.tag}\n**ID:** ${user.id}`, ephemeral: true })
  }
}

export default About
