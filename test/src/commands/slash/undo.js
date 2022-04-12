import { SlashCommand } from '../../../../hiei.js'
import { ApplicationCommandOptionType } from 'discord.js'

class Undo extends SlashCommand {
  constructor () {
    super({
      name: 'undo',
      description: 'Undo a moderator action',
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: 'timeout',
          description: 'Cancel a timeout',
          options: [
            {
              type: ApplicationCommandOptionType.User,
              name: 'user',
              description: 'The timed out user',
              required: true
            },
            {
              type: ApplicationCommandOptionType.String,
              name: 'reason',
              description: 'The reason for undoing this timeout',
              required: true
            }
          ]
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: 'strike',
          description: 'Remove a strike',
          options: [
            {
              type: ApplicationCommandOptionType.Integer,
              name: 'case',
              description: 'The case number for the strike',
              required: true
            },
            {
              type: ApplicationCommandOptionType.String,
              name: 'reason',
              description: 'The reason for undoing this strike',
              required: true
            }
          ]
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: 'ban',
          description: 'Revoke a ban',
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'user',
              description: 'The ID of the banned user',
              required: true
            },
            {
              type: ApplicationCommandOptionType.String,
              name: 'reason',
              description: 'The reason for undoing this ban',
              required: true
            }
          ]
        }
      ]
    })
  }

  async run (interaction) {
    // do things
  }
}

export default Undo
