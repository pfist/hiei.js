import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
import { discoverFiles } from '../utilities/file-util.js'
import { sortByKey } from '../utilities/array-util.js'
import { ModalSubmission } from './modal-submission.js'
import { ButtonResponse } from './button-response.js'
import ms from 'ms'

export class InteractionHandler extends EventEmitter {
  /** Handles all interactions found the interactions directory.
   * @param {Client} client - The client that runs this interaction handler.
   * @param {string} directory - The directory where interactions are stored.
   */
  constructor (client, directory) {
    super()

    this.client = client
    this.directory = directory
    this.commands = new Collection()
    this.modals = new Collection()
    this.cooldowns = new Collection()
    this.buttons = new Collection()

    this.init()
  }

  init () {
    this.client.once('ready', async () => {
      await this.loadInteractions()
      await this.syncCommands()
    })

    this.client.on('interactionCreate', async interaction => {
      if (interaction.isAutocomplete()) {
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

      if (interaction.isModalSubmit()) {
        return this.handleModalSubmission(interaction)
      }

      if (interaction.isButton()) {
        return this.handleButton(interaction)
      }
    })
  }

  async loadInteractions () {
    const files = await discoverFiles(this.directory)

    for (const file of files) {
      const { default: Interaction } = await import(pathToFileURL(file))
      const i = new Interaction()

      i.client = this.client

      if (i instanceof ModalSubmission) {
        this.modals.set(i.id, i)
      } else if (i instanceof ButtonResponse) {
        this.buttons.set(i.id, i)
      } else {
        this.commands.set(i.name, i)
        this.cooldowns.set(i.name, { member: null, timestamp: null })
      }
    }
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
      const choices = await command.choices()
      const filtered = choices.filter(choice => Object.values(choice)[0].toLowerCase().includes(focused))

      await interaction.respond(filtered.map(choice => ({ name: Object.values(choice)[0], value: Object.values(choice)[0] })))
    } catch (error) {
      console.error(error)
    }
  }

  async handleButton (interaction) {
    const button = this.buttons.get(interaction.customId)

    if (button) {
      try {
        await button.run(interaction)
      } catch (error) {
        console.error(error)
      }
    }
  }

  async handleModalSubmission (interaction) {
    const modalSubmit = this.modals.get(interaction.customId)

    if (modalSubmit) {
      try {
        await modalSubmit.run(interaction)
      } catch (error) {
        console.error(error)
      }
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

  async handleUserCommand (interaction, user) {
    const command = this.commands.get(interaction.commandName)

    try {
      await command.run(interaction, user)
    } catch (error) {
      console.error(error)
    }
  }

  formatDate (date) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'medium' }).format(date)
  }

  async handleSlashCommand (interaction) {
    const command = this.commands.get(interaction.commandName)
    const cooldown = this.cooldowns.get(interaction.commandName)
    const expiration = cooldown.timestamp + command.cooldown
    const now = Date.now()

    if (cooldown.timestamp && now < expiration) {
      await command.onCooldown(interaction, cooldown, ms(expiration - now, { long: true }))
    } else {
      try {
        await command.run(interaction)
        this.cooldowns.set(interaction.commandName, {
          member: interaction.member,
          timestamp: new Date().getTime()
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  async syncCommands () {
    const localCommands = sortByKey(this.commands.map(cmd => cmd.toJSON()), 'name')
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

    if (this.commandsUpToDate(localCommands, guildCommands)) {
      return console.log('Commands synchronized')
    } else {
      await this.updateGuildCommands(localCommands, process.env.GUILD)
    }
  }

  async updateGuildCommands (commandData, guildId) {
    console.log('Commands out of sync. Updating...')

    const guild = this.client.guilds.cache.get(guildId)
    await guild.commands.set(commandData)
    return console.log(`${commandData.length} commands registered for ${guild.name}.`)
  }

  commandsUpToDate (localCommandData, guildCommandData) {
    return JSON.stringify(localCommandData) === JSON.stringify(guildCommandData)
  }
}
