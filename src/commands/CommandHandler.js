import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
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

      const guildCommandData = await this.fetchGuildCommandData(process.env.GUILD)
      const guildCommands = sortByKey(guildCommandData.map(cmd => {
        return {
          type: cmd.type,
          name: cmd.name,
          description: cmd.description,
          options: cmd.options,
          defaultPermission: cmd.defaultPermission
        }
      }), 'name')

      // Uncomment this line to debug command sync
      // console.log(`Local: ${JSON.stringify(localCommands, null, '\t')}\n\nGuild: ${JSON.stringify(remoteCommands, null, '\t')}`)

      if (this.isOutdated(localCommands, guildCommands)) {
        return console.log('Commands up to date.')
      } else {
        await this.updateCommands(localCommands, process.env.GUILD)
        await this.updatePermissions(process.env.GUILD)
      }
    })

    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return

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
    return await this.client.guilds.cache.get(guildId).commands.fetch()
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

  isOutdated (localCommandData, guildCommandData) {
    return JSON.stringify(localCommandData) === JSON.stringify(guildCommandData)
  }

  async updateCommands (data, guildId) {
    console.log('Commands out of date. Updating...')

    const guild = this.client.guilds.cache.get(guildId)
    await guild.commands.set(data)
    return console.log(`${data.length} commands registered for ${guild.name}.`)
  }

  async updatePermissions (guildId) {
    const commands = await this.fetchGuildCommandData(guildId)
    const fullPermissions = commands.map(cmd => {
      return {
        id: cmd.id,
        permissions: this.commands.get(cmd.name).permissions
      }
    })

    await this.client.guilds.cache.get(guildId).commands.permissions.set({ fullPermissions })
    console.log('Permissions updated.')
  }
}

export default CommandHandler