import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { discoverFiles } from '../utilities/file-util.js'
import * as log from '../utilities/log-util.js'
import { dispatch } from './dispatch.js'

export async function createEventHandler (client, config) {
  const eventsPath = config.eventsDirectory ? resolve(config.eventsDirectory) : null

  if (eventsPath) {
    if (!statSync(eventsPath).isDirectory()) {
      log.warn(`Events directory ${eventsPath.slice(process.cwd().length)} not found.`)
      return
    }

    const files = await discoverFiles(eventsPath)
    if (!files.length) {
      return log.warn(`Events directory ${eventsPath.slice(process.cwd().length)} is empty.`)
    }

    for (const file of files) {
      try {
        const { default: listener } = await import(pathToFileURL(file))

        if (!listener?.event || !listener.emitter || typeof listener.execute !== 'function') {
          log.warn(`Invalid event listener is missing event name, emitter, and/or execute method: ${file}`)
          continue
        }

        const emitter = listener.emitter === 'client' ? client : listener.emitter === 'hiei' ? dispatch : null
        if (!emitter) {
          log.warn(`Unknown emitter ${listener.emitter} in event listener: ${file}`)
          continue
        }

        if (listener.once) {
          emitter.once(listener.event, (...args) => listener.execute(...args, client))
        } else {
          emitter.on(listener.event, (...args) => listener.execute(...args, client))
        }
      } catch (error) {
        log.error(`Failed to load event listener: ${file}\n`, error)
      }
    }

    log.info(`Loaded ${files.length} ${files.length === 1 ? 'event' : 'events'} from ${eventsPath.slice(process.cwd().length)}`)
  }
}
