class Listener {
  /** An event listener used for reacting to Discord events.
   * @param {string} name - The name of this listener.
   * @param {string} emitter - The source that emits the event you want to listen to.
   * @param {string} event - The event you want to listen to.
   * @param {boolean} once - Whether this listener should only run once.
   */
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
