const production = process.env.NODE_ENV === 'production'

export function info (scope, message, ...args) {
  if (!production) console.log(`[hiei:${scope}] ${message}`, ...args)
}

export function warn (scope, message, ...args) {
  if (!production) console.warn(`[hiei:${scope}] ${message}`, ...args)
}

export function error (scope, message, ...args) {
  if (!production) console.error(`[hiei:${scope}] ${message}`, ...args)
}
