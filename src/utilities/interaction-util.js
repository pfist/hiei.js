import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  ContextMenuCommandBuilder,
  MentionableSelectMenuBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  UserSelectMenuBuilder
} from 'discord.js'

export async function buildSlashCommand (command) {
  const data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)

  // Handle default member permissions
  if (command.permissions !== undefined) {
    if (isValidPermissionFlag(command.permissions)) {
      data.setDefaultMemberPermissions(command.permissions)
    } else {
      throw new Error(`[hiei:setup] Command ${command.name} has invalid permissions. Use PermissionFlagsBits.*`)
    }
  }

  // Handle options
  if (Array.isArray(command.options)) {
    for (const option of command.options) {
      buildOption(data, option)
    }
  }

  return data
}

export async function buildMessageCommand (command) {
  if (!command.name) {
    throw new Error('[hiei:setup] Message command must have a name')
  }

  const data = new ContextMenuCommandBuilder()
    .setName(command.name)
    .setType(ApplicationCommandType.Message)

  // Handle default member permissions
  if (command.permissions !== undefined) {
    if (isValidPermissionFlag(command.permissions)) {
      data.setDefaultMemberPermissions(command.permissions)
    } else {
      throw new Error(`[hiei:setup] Command ${command.name} has invalid permissions. Use PermissionFlagsBits.*`)
    }
  }

  return data
}

export async function buildUserCommand (command) {
  if (!command.name) {
    throw new Error('[hiei:setup] User command must have a name')
  }

  const data = new ContextMenuCommandBuilder()
    .setName(command.name)
    .setType(ApplicationCommandType.User)

  // Handle default member permissions
  if (command.permissions !== undefined) {
    if (isValidPermissionFlag(command.permissions)) {
      data.setDefaultMemberPermissions(command.permissions)
    } else {
      throw new Error(`[hiei:setup] Command ${command.name} has invalid permissions. Use PermissionFlagsBits.*`)
    }
  }

  return data
}

export async function buildButtonComponent (component) {
  if (!component.id) throw new Error('[hiei:setup] Button must have an id')
  if (!component.label && !component.emoji) throw new Error('[hiei:setup] Button must have a label or emoji')
  if (!component.style) throw new Error('[hiei:setup] Button must have a style')

  const data = new ButtonBuilder()
    .setStyle(component.style)

  if (component.style !== 'Link') data.setCustomId(component.id)
  if (component.label) data.setLabel(component.label)
  if (component.emoji) data.setEmoji(component.emoji)
  if (component.disabled) data.setDisabled(component.disabled)
  if (component.url && component.style === 'Link') data.setURL(component.url)

  return data
}

export async function buildModalComponent (component) {
  if (!component.id) throw new Error('[hiei:setup] Modal must have an id')
  if (!component.title) throw new Error('[hiei:setup] Modal must have a title')
  if (!Array.isArray(component.fields) || component.fields.length === 0) throw new Error('[hiei:setup] Modal must have at least one field')

  const data = new ModalBuilder()
    .setCustomId(component.id)
    .setTitle(component.title)

  for (const field of component.fields) {
    const input = new TextInputBuilder()
      .setCustomId(field.id)
      .setLabel(field.label)
      .setStyle(field.style)

    if (field.value) input.setValue(field.value)
    if (field.placeholder) input.setPlaceholder(field.placeholder)
    if (field.required !== undefined) input.setRequired(field.required)
    if (field.min !== undefined) input.setMinLength(field.min)
    if (field.max !== undefined) input.setMaxLength(field.max)

    data.addComponents(new ActionRowBuilder().addComponents(input))
  }

  return data
}

export async function buildSelectComponent (component) {
  if (!component.id) throw new Error('[hiei:setup] Select menu must have an id')
  if (!Array.isArray(component.options) || component.options.length === 0) throw new Error('[hiei:setup] Select menu must have at least one option')

  const selectBuilders = {
    'user': new UserSelectMenuBuilder(),
    'channel': new ChannelSelectMenuBuilder(),
    'role': new RoleSelectMenuBuilder(),
    'mentionable': new MentionableSelectMenuBuilder(),
    'string': new StringSelectMenuBuilder()
  }

  const select = selectBuilders[component.type]
  if (!select) throw new Error('[hiei:setup] Select menu must have a type of string, user, channel, role, or mentionable.')

  select.setCustomId(component.id)

  if (component.placeholder) select.setPlaceholder(component.placeholder)
  if (component.min !== undefined) select.setMinValues(component.minValues)
  if (component.max !== undefined) select.setMaxValues(component.maxValues)
  if (component.disabled !== undefined) select.setDisabled(component.disabled)
  if (select instanceof StringSelectMenuBuilder && Array.isArray(component.options)) {
    select.addOptions(
      component.options.map(o =>
        new StringSelectMenuOptionBuilder()
          .setLabel(o.label)
          .setValue(o.value)
          .setDescription(o.description || '')
          .setDefault(o.default || false)
          .setEmoji(o.emoji)
      )
    )
  }

  return select
}

function buildSubcommand (subcommand, option) {
  subcommand
    .setName(option.name)
    .setDescription(option.description)
  if (Array.isArray(option.options)) {
    for (const subcommandOption of option.options) {
      buildOption(subcommand, subcommandOption)
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
      buildOption(group, subcommand)
    }
  }

  return group
}

async function isValidPermissionFlag (value) {
  return Object.values(PermissionFlagsBits).includes(value)
}

function buildOption(data, option) {
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
  if (!builder) throw new Error(`[hiei:setup] Unknown option type ${option.type} in command ${data.name}`)
  builder(data, option)
}
