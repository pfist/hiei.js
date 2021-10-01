import { ButtonComponent } from '../../../hiei.js'

class YesButton extends ButtonComponent {
  constructor () {
    super({
      id: 'yes',
      label: 'Yes',
      style: 'SUCCESS'
    })
  }

  async use (interaction) {
    await interaction.reply('Yes, you clicked a button.')
    console.log(interaction.message.components[0])
  }
}

export default YesButton
