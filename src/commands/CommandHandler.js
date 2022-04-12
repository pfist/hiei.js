import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection, EmbedBuilder } from 'discord.js'
import { getFiles, sortByKey } from '../HieiUtil.js'
import { channelMention } from '@discordjs/builders'

class CommandHandler extends EventEmitter {
  /** Handles all commands found the commands directory.
   * @param {Client} client - The client this command handler runs on.
   * @param {string} directory - The directory where command files will be handled recursively.
   */
  constructor (client, directory) {
    super()

    this.client = client
    this.directory = directory
    this.commands = new Collection()

    this.init()
  }

  init () {
    this.client.once('ready', async () => {
      const files = await getFiles(this.directory)

      for (const file of files) {
        const Command = (await import(pathToFileURL(file))).default
        const c = new Command()

        c.client = this.client
        this.commands.set(c.name, c)
      }

      const localCommands = sortByKey(this.commands.map(cmd => {
        return {
          type: cmd.type,
          name: cmd.name,
          description: cmd.description,
          options: cmd.options.map(o => {
            if (!o.required && o.type !== 1) {
              o.required = false
            }

            return o
          }),
          defaultPermission: cmd.defaultPermission ? cmd.defaultPermission : true
        }
      }), 'name')

      const remoteCommandData = await this.getRemoteCommands()
      const remoteCommands = sortByKey(remoteCommandData.map(cmd => {
        return {
          type: cmd.type,
          name: cmd.name,
          description: cmd.description,
          options: cmd.options,
          defaultPermission: cmd.defaultPermission
        }
      }), 'name')

      if (JSON.stringify(localCommands) === JSON.stringify(remoteCommands)) {
        return console.log('No command changes detected. Skipping registration.')
      } else {
        this.registerCommands(localCommands)
        await this.setPermissions()
      }
    })

    this.client.on('interactionCreate', async interaction => {
      // if (!interaction.isCommand() && !interaction.isContextMenu()) return

      if (interaction.isChatInputCommand()) {
        return this.handleSlashCommand(interaction)
      }

      if (interaction.isMessageContextMenuCommand()) {
        return this.handleMessageCommand(interaction, interaction.options.getMessage('message'))
      }

      if (interaction.isUserContextMenuCommand()) {
        return this.handleUserCommand(interaction, interaction.options.getUser('user'))
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId === 'surveyModal') {
          const submitter = interaction.user
          const color = interaction.fields.getTextInputValue('favoriteColorInput')
          const hobbies = interaction.fields.getTextInputValue('hobbiesInput')
          const channel = interaction.guild.channels.cache.get('962215455840419870')

          await channel.send({ content: `Survey submitted by ${submitter}:\nFavorite color: ${color}\nHobbies: ${hobbies}` })
          return interaction.reply({ content: `Your response was submitted to ${channelMention('962215455840419870')}`, ephemeral: true })
        }

        if (interaction.customId === 'jobModal') {
          const submitter = interaction.user
          const role = interaction.fields.getTextInputValue('role')
          const location = interaction.fields.getTextInputValue('location')
          const responsibilities = interaction.fields.getTextInputValue('responsibilities')
          const qualificiations = interaction.fields.getTextInputValue('qualifications')
          const apply = interaction.fields.getTextInputValue('apply')
          const channel = interaction.guild.channels.cache.get('962242384807227464')
          const jobPost = new EmbedBuilder()
            .setTitle(role)
            .addFields(
              { name: 'Location', value: location },
              { name: 'Responsibilities', value: responsibilities },
              { name: 'Qualifications', value: qualificiations },
              { name: 'How to Apply', value: apply }
            )
            .setTimestamp()

          await channel.send({ content: `Posted by <@${submitter.id}>`, embeds: [jobPost] })
          return interaction.reply({ content: `Your job opportunity was successfully submitted to ${channelMention('962242384807227464')}`, ephemeral: true })
        }
      }
    })
  }

  async handleMessageCommand (interaction, message) {
    const command = this.commands.get(interaction.commandName)

    try {
      await command.run(interaction, message)
    } catch (error) {
      console.error(error)
    }
  }

  async handleSlashCommand (interaction) {
    const command = this.commands.get(interaction.commandName)

    try {
      await command.run(interaction)
    } catch (error) {
      console.error(error)
    }
  }

  async handleUserCommand (interaction, user) {
    const command = this.commands.get(interaction.commandName)

    try {
      await command.run(interaction, user)
    } catch (error) {
      console.error(error)
    }
  }

  async getRemoteCommands () {
    return await this.client.guilds.cache.get(process.env.GUILD)?.commands.fetch()
  }

  async registerCommands (data) {
    await this.client.guilds.cache.get(process.env.GUILD).commands.set(data)
    return console.log(`${data.length} commands registered.`)
  }

  async setPermissions () {
    const commands = await this.getRemoteCommands()
    const fullPermissions = commands.map(cmd => {
      return {
        id: cmd.id,
        permissions: this.commands.get(cmd.name).permissions
      }
    })

    await this.client.guilds.cache.get(process.env.GUILD).commands.permissions.set({ fullPermissions })
    console.log('Permissions updated.')
  }
}

export default CommandHandler
