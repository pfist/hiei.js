import EventEmitter from 'node:events'
import { pathToFileURL } from 'node:url'
import { getFiles } from '../utilities/file-util.js'

export class ListenerHandler extends EventEmitter {
  /** Handles all event listeners found in the listeners directory.
   * @param {Client} client - The client this listener handler runs on.
   * @param {string} directory - The directory where listener files will be handled recursively.
   */
  constructor (client, directory) {
    super()

    this.client = client
    this.directory = directory

    this.init()
  }

  async init () {
    const files = await getFiles(this.directory)

    for (const file of files) {
      const Listener = (await import(pathToFileURL(file))).default
      const l = new Listener()

      l.client = this.client

      if (l.once) {
        this.client.once(l.event, (...args) => l.run(...args))
      } else {
        this.client.on(l.event, (...args) => l.run(...args))
      }
    }
  }
}
