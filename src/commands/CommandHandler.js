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

      // Uncomment this line to debug command sync
      // console.log(`Local: ${JSON.stringify(localCommands, null, '\t')}\n\nGuild: ${JSON.stringify(remoteCommands, null, '\t')}`)

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
