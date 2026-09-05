const production = process.env.NODE_ENV === 'production'

export function info (message, ...args) {
  if (!production) console.log(`[hiei] ${message}`, ...args)
}

export function warn (message, ...args) {
  if (!production) console.warn(`[hiei] ${message}`, ...args)
}

export function error (message, ...args) {
  if (!production) console.error(`[hiei] ${message}`, ...args)
}
