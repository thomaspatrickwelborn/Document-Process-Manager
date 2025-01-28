export default class MessageAdapter extends EventTarget {
  #settings
  #socket
  #messages
  #message
  constructor($settings, $socket) {
    super()
    this.#settings = $settings
    this.#socket = $socket
  }
  get name() { return this.#settings.name }
  get messages() {
    if(this.#messages !== undefined) {
      return this.#messages
    }
    if(this.#settings.messages !== undefined) {
      this.#messages = this.#settings.messages
    }
    else {
      this.#messages = {}
    }
    return this.#messages
  }
  get message() {
    if(this.#message !== undefined) {
      return this.#message
    }
    this.#message = this.#settings.message
    return this.#message
  }
}