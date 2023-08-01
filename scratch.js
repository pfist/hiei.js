import ms from 'ms'
import { time } from '@discordjs/builders'

const now = new Date().getTime()
const timestamp = new Date('August 1, 2023 16:00:00').getTime()
const cooldown = ms('30 minutes')
const expiration = timestamp + cooldown
const remaining = expiration - now

console.log(`Now:       ${formatDate(now)}`)
console.log(`Timestamp: ${formatDate(timestamp)}`)
console.log(`Expiration: ${formatDate(expiration)}`)
console.log(`Remaining: ${ms(remaining)}`)

if (timestamp < expiration) {
  console.log(`Command is on cooldown. Try again ${time(new Date(expiration), 'R')}.`)
} else {
  console.log('Command used successfully')
}

function formatDate (date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'medium' }).format(date)
}
