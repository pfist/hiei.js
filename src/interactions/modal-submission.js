export class ModalSubmission {
  /** An interaction created by someone submitting a modal.
   * @param {string} id - The custom ID of the submitted modal.
   */
  constructor ({ id }) {
    this.id = id
  }

  run () {
    throw new Error(`Error: ${this.constructor.name}#run not implemented`)
  }
}
