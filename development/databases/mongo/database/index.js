import mongoose, { Schema } from 'mongoose'
export default class MongoDatabase extends EventTarget {
  #settings
  #databases
  #active = false
  #boundConnectionConnected = this.#connectionConnected.bind(this)
  #boundConnectionDisconnected = this.#connectionDisconnected.bind(this)
  #boundConnectionError = this.#connectionError.bind(this)
  #boundWebSocketMessage = this.#connectionMessage.bind(this)
  constructor() {
    super()
    this.#settings = $settings
    this.#databases = $databases
    this.active = this.#settings.active
  }
  get active() { return this.#active }
  set active($active) {
    if($active === true) {
      this.connection
    }
    else if($active === false) {
      this.connection?.close()
    }
    this.#active = $active
  }
  get fileReference() { return this.#settings.fileReference }
  get path() { return this.#settings.path }
  get connection() {
    if(this.#connection !== undefined) { return this.#connection }
    this.#connection = mongoose.createConnection(this.path, this.options)
    this.#connection.on('connection', this.#boundConnectionConnected)
    this.#connection.on('close', this.#boundConnectionDisconnected)
    this.#connection.on('error', this.#boundConnectionError)
    return this.#connection
  }
  #connectionConnected() {}
  #connectionDisconnected() { this.#connection = undefined  }
  #connectionError($error) { console.error($error) }
}