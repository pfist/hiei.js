import HieiError from '../HieiError.js'
import { MessageButton } from 'discord.js'

class ButtonComponent {
  constructor ({ id, label, style, disabled = false, emoji, url } = {}) {
    this.data = new MessageButton()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(style)

    if (disabled) this.data.setDisabled(disabled)
    if (emoji) this.data.setEmoji(emoji)
    if (url) this.data.setUrl(url)
  }

  use () {
    throw new HieiError('NOT_IMPLEMENTED', this.constructor.name, 'use')
  }
}

export default ButtonComponent
