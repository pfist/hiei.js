const ErrorTypes = {
  MISSING_KEYS: (array, key) => `Every object in array ${array} must contain the ${key} key`,
  NOT_IMPLEMENTED: (constructor, method) => `${constructor}#${method} has not been implemented`
}

class HieiError extends Error {
  constructor (key, ...args) {
    if (ErrorTypes[key] == null) {
      throw new TypeError(`Error type ${key} does not exist`)
    }

    const message = typeof ErrorTypes[key] === 'function' ? ErrorTypes[key](...args) : ErrorTypes[key]
    super(message)

    this.code = key
  }

  get name () {
    return `${this.constructor.name} [${this.code}]`
  }
}

export default HieiError
