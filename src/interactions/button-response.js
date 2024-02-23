export class ButtonResponse {
  /** An interaction created by someone clicking a button.
   * @param {string} id - The custom ID of the clicked button.
   */
  constructor ({ id }) {
    this.id = id
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}
