class Listener {
  constructor ({ name, emitter, event, once } = {}) {
    this.name = name
    this.emitter = emitter
    this.event = event
    this.once = once
    this.client = null
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}

export default Listener
