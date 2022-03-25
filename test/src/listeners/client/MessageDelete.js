import { Listener } from '../../../../hiei.js'

class MessageDelete extends Listener {
  constructor () {
    super({
      name: 'MessageDelete',
      emitter: 'client',
      event: 'messageDelete'
    })
  }

  run (message) {
    console.log(`A message in ${message.channel} was deleted:`, message.content)
  }
}

export default MessageDelete
