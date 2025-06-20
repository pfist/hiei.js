import {
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ContextMenuCommandBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  TextInputBuilder
} from 'discord.js'

export async function buildSlashCommand (command) {
  const data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)

  // Handle default member permissions
  if (command.defaultMemberPermissions !== undefined) {
    if (isValidPermissionFlag(command.defaultMemberPermissions)) {
      data.setDefaultMemberPermissions(command.defaultMemberPermissions)
    } else {
      throw new Error(`[hiei:setup] Command ${command.name} has invalid defaultMemberPermissions. Use PermissionFlagsBits.*`)
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
  if (command.defaultMemberPermissions !== undefined) {
    if (isValidPermissionFlag(command.defaultMemberPermissions)) {
      data.setDefaultMemberPermissions(command.defaultMemberPermissions)
    } else {
      throw new Error(`[hiei:setup] Command ${command.name} has invalid defaultMemberPermissions. Use PermissionFlagsBits.*`)
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
  if (command.defaultMemberPermissions !== undefined) {
    if (isValidPermissionFlag(command.defaultMemberPermissions)) {
      data.setDefaultMemberPermissions(command.defaultMemberPermissions)
    } else {
      throw new Error(`[hiei:setup] Command ${command.name} has invalid defaultMemberPermissions. Use PermissionFlagsBits.*`)
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

  let data

  switch (component.type) {
    case 'user':
      data = new UserSelectMenuBuilder()
      break
    case 'channel':
      data = new ChannelSelectMenuBuilder()
      break
    case 'role':
      data = new RoleSelectMenuBuilder()
      break
    case 'mentionable':
      data = new MentionableSelectMenuBuilder()
      break
    case 'string':
      data = new StringSelectMenuBuilder()
      break
    default:
      throw new Error('[hiei:setup] Select menu must have a type of string, user, channel, role, or mentionable.')
  }

  data.setCustomId(component.id)

  if (component.placeholder) data.setPlaceholder(component.placeholder)
  if (component.min !== undefined) data.setMinValues(component.minValues)
  if (component.max !== undefined) data.setMaxValues(component.maxValues)
  if (component.disabled !== undefined) data.setDisabled(component.disabled)
  if (data instanceof StringSelectMenuBuilder && Array.isArray(component.options)) {
    data.addOptions(
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

  return data
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
}

async function isValidPermissionFlag (value) {
  return Object.values(PermissionFlagsBits).includes(value)
}

function buildOption (data, option) {
  switch (option.type) {
    case 'attachment':
      data.addAttachmentOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
      })
      break
    case 'boolean':
      data.addBooleanOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
      })
      break
    case 'channel':
      data.addChannelOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
        if (o.types) o.addChannelTypes(option.types)
        return o
      })
      break
    case 'integer':
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
      break
    case 'mentionable':
      data.addMentionableOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
      })
      break
    case 'number':
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
      break
    case 'role':
      data.addRoleOption(o => {
        o
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required ?? false)
      })
      break
    case 'string':
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
      break
    case 'subcommand':
      data.addSubcommand(sub => buildSubcommand(sub, option))
      break
    case 'subcommand-group':
      data.addSubcommandGroup(group => buildSubcommandGroup(group, option))
      break
    default:
      throw new Error(`[hiei:setup] Unknown option type ${option.type} in command ${data.name}`)
  }
}
