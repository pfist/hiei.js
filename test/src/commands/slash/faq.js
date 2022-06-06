import { SlashCommand } from '../../../../hiei.js'
import { ApplicationCommandOptionType } from 'discord.js'

class FAQ extends SlashCommand {
  constructor () {
    super({
      name: 'faq',
      description: 'Quickly share the answer to a frequently asked question',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'question',
          description: 'The question you want to answer',
          required: true,
          autocomplete: true
        }
      ]
    })
  }

  get choices () {
    return [
      { name: 'Starbucks or Dutch Bros?', value: 'Dutch Bros. Better flavor, lower sugar.' },
      { name: 'What is the airspeed velocity of an unladen swallow?', value: 'Huh, I don\'t know that. Aaaaggghhh!' },
      { name: 'What is the best time of year?', value: 'Halloween. :ghost:' }
    ]
  }

  async run (interaction) {
    const question = interaction.options.getString('question')
    const answer = this.choices.find(choice => choice.name === question).value

    return interaction.reply({ content: answer })
  }
}

export default FAQ
