import { Core } from 'core-plex'
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
    this.#settings = Settings($settings)
    this.#options = Options($options)
  }
  get settings() { return this.#settings }
  get options() { return this.#options }
}