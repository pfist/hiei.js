import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection, InteractionType } from 'discord.js'
import { getFiles, sortByKey } from '../HieiUtil.js'

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

      const localCommands = sortByKey(this.commands.map(cmd => cmd.asPayload()), 'name')
      const guildCommandData = await this.fetchGuildCommandData(process.env.GUILD)
      const guildCommands = sortByKey(guildCommandData.map(cmd => {
        return {
          type: cmd.type,
          name: cmd.name,
          description: cmd.description,
          options: cmd.options,
          defaultMemberPermissions: cmd.defaultMemberPermissions
        }
      }), 'name')

      // Uncomment this line to debug command sync
      // console.log(`Local: ${JSON.stringify(localCommands)}\n\nGuild: ${JSON.stringify(guildCommands)}`)

      if (this.isInSync(localCommands, guildCommands)) {
        return console.log('Commands in sync. Keep on keeping on.')
      } else {
        await this.syncCommands(localCommands, process.env.GUILD)
      }
    })

    this.client.on('interactionCreate', async interaction => {
      // if (!interaction.isCommand()) return

      if (interaction.type === InteractionType.Autocomplete) {
        return this.handleAutocomplete(interaction)
      }

      if (interaction.isChatInputCommand()) {
        return this.handleSlashCommand(interaction)
      }

      if (interaction.isMessageContextMenuCommand()) {
        return this.handleMessageCommand(interaction, interaction.options.getMessage('message'))
      }

      if (interaction.isUserContextMenuCommand()) {
        return this.handleUserCommand(interaction, interaction.options.getUser('user'))
      }
    })
  }

  async fetchGuildCommandData (guildId) {
    if (this.client.guilds.cache.some(guild => guild.id === guildId)) return await this.client.guilds.cache.get(guildId).commands.fetch()
    const guild = this.client.guilds.fetch(guildId)
    return await guild.commands.fetch()
  }

  async handleAutocomplete (interaction) {
    const command = this.commands.get(interaction.commandName)
    const focused = interaction.options.getFocused()

    try {
      const choices = command.choices
      const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focused))

      await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.name })))
    } catch (error) {
      console.error(error)
    }
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

  isInSync (localCommandData, guildCommandData) {
    return JSON.stringify(localCommandData) === JSON.stringify(guildCommandData)
  }

  async syncCommands (data, guildId) {
    console.log('Commands out of sync. Updating...')

    const guild = this.client.guilds.cache.get(guildId)
    await guild.commands.set(data)
    return console.log(`${data.length} commands registered for ${guild.name}.`)
  }
}

export default CommandHandler
