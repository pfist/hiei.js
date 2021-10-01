import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { Collection } from 'discord.js'
import { getFiles } from '../HieiUtil.js'

export class ComponentHandler extends EventEmitter {
  constructor (client, directory) {
    super()

    this.client = client
    this.directory = directory
    this.components = new Collection()

    this.init()
  }

  async init () {
    const files = await getFiles(this.directory)

    for (const file of files) {
      const Component = (await import(pathToFileURL(file))).default
      const c = new Component()

      c.client = this.client
      this.components.set(c.data.customId, c)
    }

    this.client.on('interactionCreate', async i => {
      if (!i.isMessageComponent()) return
      console.log(`[Interaction]\n  ID: ${i.customId}\n  isMessageComponent: ${i.isMessageComponent()}\n  isButton: ${i.isButton()}\n  isSelectMenu: ${i.isSelectMenu()}\n`)

      if (i.isButton()) {
        return this.handleButton(i)
      }

      // if (i.isSelectMenu()) {
      //   return this.handleSelectMenu(i)
      // }
    })
  }

  async handleButton (i) {
    const button = this.components.get(i.customId)

    try {
      await button.use(i)
    } catch (error) {
      console.error(error)
      await i.reply({ content: 'There was a problem using that button.', ephemeral: true })
    }
  }

  // async handleSelectMenu (i) {
  //   const select = this.components.get(i.customId)

  //   try {
  //     await select.use(i)
  //   } catch (error) {
  //     console.error(error)
  //     await i.reply({ content: 'There was a problem using that select menu.', ephemeral: true })
  //   }
  // }
}

export default ComponentHandler
