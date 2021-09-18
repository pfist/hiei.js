import HieiError from '../HieiError.js'

class Listener {
  constructor ({ name, emitter, event, once = false } = {}) {
    this.name = name
    this.emitter = emitter
    this.event = event
    this.once = once
    this.client = null
  }

  run () {
    throw new HieiError('NOT_IMPLEMENTED', this.constructor.name, 'run')
  }
}

export default Listener
