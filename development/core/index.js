import { Core } from 'core-plex'
import { recursiveAssign } from '../coutil/index.js'
import Settings from './settings/index.js'
import Options from './options/index.js'

export default class DPMCore extends Core {
  #settings
  #options
  constructor($settings = {}, $options = {}) {
    super({
      events: $settings.events || {},
      propertyDefinitions: $settings.propertyDefinitions || {},
    })
    this.#settings = recursiveAssign({}, Settings, $settings)
    this.#options = recursiveAssign({}, Options, $options)
  }
  get settings() { return this.#settings }
  get options() { return this.#options }
}