import { MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
  interaction: 'slash',
  name: 'mention',
  description: 'Test user, role, and channel mentions',
  permissions: PermissionFlagsBits.SendMessages,
  options: [
    {
      type: 'subcommand-group',
      name: 'options',
      description: 'Choose a mention type',
      commands: [
        {
          type: 'subcommand',
          name: 'user',
          description: 'Mention a user',
          options: [
            {
              type: 'user',
              name: 'user',
              description: 'The user you wish to mention',
              required: true
            }
          ]
        },
        {
          type: 'subcommand',
          name: 'role',
          description: 'Mention a role',
          options: [
            {
              type: 'role',
              name: 'role',
              description: 'The role you wish to mention',
              required: true
            }
          ]
        },
        {
          type: 'subcommand',
          name: 'channel',
          description: 'Mention a channel',
          options: [
            {
              type: 'channel',
              name: 'channel',
              description: 'The channel you wish to mention',
              required: true
            }
          ]
        },
        {
          type: 'subcommand',
          name: 'all',
          description: 'Mention a mentionable (user or role)',
          options: [
            {
              type: 'mentionable',
              name: 'mentionable',
              description: 'The user or role you wish to mention',
              required: true
            }
          ]
        }
      ]
    }
  ],
  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'user': {
        const user = interaction.options.getUser('user')
        interaction.reply({
          content: `You mentioned user <@${user.id}>`,
          flags: [MessageFlags.Ephemeral]
        })
        break
      }
      case 'role': {
        const role = interaction.options.getRole('role')
        interaction.reply({
          content: `You mentioned role <@&${role.id}>`,
          flags: [MessageFlags.Ephemeral]
        })
        break
      }
      case 'channel': {
        const channel = interaction.options.getChannel('channel')
        interaction.reply({
          content: `You mentioned channel <#${channel.id}>`,
          flags: [MessageFlags.Ephemeral]
        })
        break
      }
      case 'all': {
        const mentionable = interaction.options.getMentionable('mentionable')
        const mention = mentionable.position ? `role <@&${mentionable.id}>` : `user <@${mentionable.id}>`
        interaction.reply({
          content: `You mentioned ${mention}`,
          flags: [MessageFlags.Ephemeral]
        })
        break
      }
    }
  }
}
