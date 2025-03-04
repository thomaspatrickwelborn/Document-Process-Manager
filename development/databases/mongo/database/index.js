import mongoose, { Schema } from 'mongoose'
import { Core } from 'core-plex'
export default class MongoDatabase extends Core {
  #connection
  #path
  #parent
  #active = false
  #_models
  constructor($settings, $options, $parent) {
    super(Object.assign({
      propertyClasses: MongoDatabase.propertyClasses,
    }, $settings), $options)
    this.#parent = $parent
    this.addEvents([
      // Connection Events
      {
        path: 'connection', type: 'connected', 
        listener: function connectionConnected($event) { this.#models }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      {
        path: 'connection', type: 'close', 
        listener: function connectionClose($event) { this.#connection = undefined }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      {
        path: 'connection', type: 'error', 
        listener: function connectionError($error) { console.error($error) }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      }
    ])
    this.enableEvents()
    this.active = this.settings.active
  }
  get parent() { return this.#parent }
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
    return this.#connection
  }
  get #models() {
    iterateModels: 
    for(const [$modelName, $schema] of this.settings.models) {
      if(this.connection.models[$modelName] !== undefined) { continue iterateModels }
      this.connection.model($modelName, $schema)
    }
    return this.connection.models
  }
}