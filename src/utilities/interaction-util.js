import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js'

export async function buildSlashCommand(command) {
  if (!command.name) {
    throw new Error('[hiei] Slash command must have a name.')
  }

  const data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)

  // Handle default member permissions
  if (command.permissions !== undefined) {
    if (isValidPermissionFlag(command.permissions)) {
      data.setDefaultMemberPermissions(command.permissions)
    } else {
      throw new Error(`[hiei] Command ${command.name} has invalid permissions. Use PermissionFlagsBits.*`)
    }
  }

  // Handle options
  if (Array.isArray(command.options)) {
    for (const option of command.options) {
      buildSlashCommandOption(data, option)
    }
  }

  return data
}

function buildSlashCommandOption (data, option) {
  const optionBuilders = {
    'attachment': (data, option) => {
      data.addAttachmentOption(o =>
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false))
    },
    'boolean': (data, option) => {
      data.addBooleanOption(o =>
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false))
    },
    'channel': (data, option) => {
      data.addChannelOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
        if (o.types) o.addChannelTypes(option.types)
        return o
      })
    },
    'integer': (data, option) => {
      data.addIntegerOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
        if (option.choices) o.addChoices(option.choices)
        if (option.autocomplete) o.setAutocomplete(true)
        if (option.min) o.setMinValue(option.min)
        if (option.max) o.setMaxValue(option.max)
        return o
      })
    },
    'mentionable': (data, option) => {
      data.addMentionableOption(o =>
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false))
    },
    'number': (data, option) => {
      data.addNumberOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
        if (option.choices) o.addChoices(option.choices)
        if (option.autocomplete) o.setAutocomplete(true)
        if (option.min) o.setMinValue(option.min)
        if (option.max) o.setMaxValue(option.max)
        return o
      })
    },
    'role': (data, option) => {
      data.addRoleOption(o =>
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false))
    },
    'string': (data, option) => {
      data.addStringOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
        if (option.choices) o.addChoices(option.choices)
        if (option.autocomplete) o.setAutocomplete(true)
        if (option.min) o.setMinLength(option.min)
        if (option.max) o.setMaxLength(option.max)
        return o
      })
    },
    'subcommand': (data, option) => {
      data.addSubcommand(sub => buildSubcommand(sub, option))
    },
    'subcommand-group': (data, option) => {
      data.addSubcommandGroup(group => buildSubcommandGroup(group, option))
    },
    'user': (data, option) => {
      data.addUserOption(o =>
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false))
    }
  }

  const builder = optionBuilders[option.type]
  if (!builder) throw new Error(`[hiei] Unknown option type ${option.type} in command ${data.name}`)
  builder(data, option)
}

export async function buildMessageCommand (command) {
  if (!command.name) {
    throw new Error('[hiei] Message command must have a name.')
  }

  const data = new ContextMenuCommandBuilder()
    .setName(command.name)
    .setType(ApplicationCommandType.Message)

  // Handle default member permissions
  if (command.permissions !== undefined) {
    if (isValidPermissionFlag(command.permissions)) {
      data.setDefaultMemberPermissions(command.permissions)
    } else {
      throw new Error(`[hiei] Command ${command.name} has invalid permissions. Use PermissionFlagsBits.*`)
    }
  }

  return data
}

export async function buildUserCommand (command) {
  if (!command.name) {
    throw new Error('[hiei] User command must have a name.')
  }

  const data = new ContextMenuCommandBuilder()
    .setName(command.name)
    .setType(ApplicationCommandType.User)

  // Handle default member permissions
  if (command.permissions !== undefined) {
    if (isValidPermissionFlag(command.permissions)) {
      data.setDefaultMemberPermissions(command.permissions)
    } else {
      throw new Error(`[hiei] Command ${command.name} has invalid permissions. Use PermissionFlagsBits.*`)
    }
  }

  return data
}

function buildSubcommand (subcommand, option) {
  subcommand
    .setName(option.name)
    .setDescription(option.description)
  if (Array.isArray(option.options)) {
    for (const subcommandOption of option.options) {
      buildSlashCommandOption(subcommand, subcommandOption)
    }
  }

  return subcommand
}

function buildSubcommandGroup (group, option) {
  group
    .setName(option.name)
    .setDescription(option.description)
  if (Array.isArray(option.commands)) {
    for (const subcommand of option.commands) {
      buildSlashCommandOption(group, subcommand)
    }
  }

  return group
}

async function isValidPermissionFlag (value) {
  return Object.values(PermissionFlagsBits).includes(value)
}
