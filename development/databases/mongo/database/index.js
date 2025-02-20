import mongoose, { Schema } from 'mongoose'
import Core from '../../../core/index.js'
export default class MongoDatabase extends Core {
  #connection
  #path
  #active = false
  #boundConnectionConnected = this.#connectionConnected.bind(this)
  #boundConnectionDisconnected = this.#connectionDisconnected.bind(this)
  #boundConnectionError = this.#connectionError.bind(this)
  #_models
  constructor($settings, $databases) {
    super(...arguments)
    this.active = this.settings.active
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
  get fileReference() { return this.settings.fileReference }
  get path() {
    if(this.#path !== undefined) { return this.#path }
    const { protocol, host, port, path } = this.settings
    this.#path = [protocol, '//', host, ':', port, path].join('')
    return this.#path
  }
  get connection() {
    if(this.#connection !== undefined) { return this.#connection }
    this.#connection = mongoose.createConnection(this.path, this.options)
    this.#connection.on('connected', this.#boundConnectionConnected)
    this.#connection.on('close', this.#boundConnectionDisconnected)
    this.#connection.on('error', this.#boundConnectionError)
    return this.#connection
  }
  #connectionConnected() { this.#models }
  #connectionDisconnected() { this.#connection = undefined  }
  #connectionError($error) { console.error($error) }
  get #models() {
    iterateModels: 
    for(const [$modelName, $schema] of this.settings.models) {
      if(this.connection.models[$modelName] !== undefined) { continue iterateModels }
      this.connection.model($modelName, $schema)
    }
    return this.connection.models
  }
}