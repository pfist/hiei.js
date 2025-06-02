import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { discoverFiles } from '../utilities/file-util.js'
import { dispatch } from './dispatch.js'

export async function createEventHandler (client, { eventDirectory = './src/events' }) {
  const eventsPath = resolve(process.cwd(), eventDirectory)
  const displayPath = eventsPath.startsWith(process.cwd()) ? '.' + eventsPath.slice(process.cwd().length) : eventsPath

  if (!existsSync(eventsPath)) {
    console.warn('[hiei:events] There is no events directory. Event listeners will be disabled.')
    return
  }

  const files = await discoverFiles(eventsPath)
  if (!files.length) {
    return console.warn(`[hiei:events] Events directory is empty: ${displayPath}`)
  }

  for (const file of files) {
    try {
      const { default: listener } = await import(pathToFileURL(file))

      if (!listener || !listener.name || !listener.emitter || typeof listener.execute !== 'function') {
        console.warn(`[hiei:events] Invalid event listener is missing name, emitter, and/or execute method: ${file}`)
        continue
      }

      const emitter = listener.emitter === 'client' ? client : listener.emitter === 'hiei' ? dispatch : null
      if (!emitter) {
        console.warn(`[hiei:events] Unknown emitter ${listener.emitter} in event listener: ${file}`)
        continue
      }

      if (listener.once) {
        emitter.once(listener.name, (...args) => listener.execute(...args, client))
      } else {
        emitter.on(listener.name, (...args) => listener.execute(...args, client))
      }
    } catch (error) {
      console.error(`[hiei:events] Failed to load event listener: ${file}\n`, error)
    }
  }

  console.log(`[hiei:events] Loaded ${files.length} ${files.length === 1 ? 'event' : 'events'} from ${displayPath}`)
}
