import {
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ContextMenuCommandBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
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
      throw new Error(`Command ${command.name} has invalid defaultMemberPermissions. Use PermissionFlagsBits.*`)
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
    throw new Error('Message command must have a name')
  }

  const data = new ContextMenuCommandBuilder()
    .setName(command.name)
    .setType(ApplicationCommandType.Message)

  // Handle default member permissions
  if (command.defaultMemberPermissions !== undefined) {
    if (isValidPermissionFlag(command.defaultMemberPermissions)) {
      data.setDefaultMemberPermissions(command.defaultMemberPermissions)
    } else {
      throw new Error(`Command ${command.name} has invalid defaultMemberPermissions. Use PermissionFlagsBits.*`)
    }
  }

  return data
}

export async function buildUserCommand (command) {
  if (!command.name) {
    throw new Error('User command must have a name')
  }

  const data = new ContextMenuCommandBuilder()
    .setName(command.name)
    .setType(ApplicationCommandType.User)

  // Handle default member permissions
  if (command.defaultMemberPermissions !== undefined) {
    if (isValidPermissionFlag(command.defaultMemberPermissions)) {
      data.setDefaultMemberPermissions(command.defaultMemberPermissions)
    } else {
      throw new Error(`Command ${command.name} has invalid defaultMemberPermissions. Use PermissionFlagsBits.*`)
    }
  }

  return data
}

export async function buildButtonComponent (component) {
  if (!component.id) throw new Error('Button must have an id')
  if (!component.label && !component.emoji) throw new Error('Button must have a label or emoji')
  if (!component.style) throw new Error('Button must have a style')

  const data = new ButtonBuilder()
    .setCustomId(component.id)
    .setStyle(component.style)

  if (component.label) data.setLabel(component.label)
  if (component.emoji) data.setEmoji(component.emoji)
  if (component.disabled) data.setDisabled(component.disabled)
  if (component.url && component.style === 'LINK') data.setURL(component.url)

  return data
}

export async function buildModalComponent (component) {
  if (!component.id) throw new Error('Modal must have an id')
  if (!component.title) throw new Error('Modal must have a title')
  if (!Array.isArray(component.fields) || component.fields.length === 0) throw new Error('Modal must have at least one field')

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
  if (!component.id) throw new Error('Select menu must have an id')
  if (!Array.isArray(component.options) || component.options.length === 0) throw new Error('Select menu must have at least one option')

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
    default:
      // Default to StringSelectMenuBuilder
      data = new StringSelectMenuBuilder()
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
  if (Array.isArray(option.options)) {
    for (const subcommand of option.options) {
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
      throw new Error(`Unknown option type ${option.type} in command ${data.name}`)
  }
}
