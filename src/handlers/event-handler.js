import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { discoverFiles } from '../utilities/file-util.js'
import { dispatch } from './dispatch.js'
import * as log from '../utilities/log-util.js'

export async function createEventHandler (client, { eventDirectory = './src/events' }) {
  const eventsPath = resolve(process.cwd(), eventDirectory)
  const eventsPathRelative = eventsPath.startsWith(process.cwd()) ? '.' + eventsPath.slice(process.cwd().length) : eventsPath

  if (!existsSync(eventsPath)) {
    log.warn('setup', 'There is no events directory. Event listeners will be disabled.')
    return
  }

  const files = await discoverFiles(eventsPath)
  if (!files.length) {
    return log.warn('setup', `Events directory is empty: ${eventsPathRelative}`)
  }

  for (const file of files) {
    try {
      const { default: listener } = await import(pathToFileURL(file))

      if (!listener || !listener.name || !listener.emitter || typeof listener.execute !== 'function') {
        log.warn('setup', `Invalid event listener is missing name, emitter, and/or execute method: ${file}`)
        continue
      }

      const emitter = listener.emitter === 'client' ? client : listener.emitter === 'hiei' ? dispatch : null
      if (!emitter) {
        log.warn('setup', `Unknown emitter ${listener.emitter} in event listener: ${file}`)
        continue
      }

      if (listener.once) {
        emitter.once(listener.name, (...args) => listener.execute(...args, client))
      } else {
        emitter.on(listener.name, (...args) => listener.execute(...args, client))
      }
    } catch (error) {
      log.error('setup', `Failed to load event listener: ${file}\n`, error)
    }
  }

  log.info('setup', `Loaded ${files.length} ${files.length === 1 ? 'event' : 'events'} from ${eventsPathRelative}`)
}
