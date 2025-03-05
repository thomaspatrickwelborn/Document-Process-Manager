import { Core, Coutil } from 'core-plex'
const { recursiveAssign } = Coutil
import Settings from './settings/index.js'
import Options from './options/index.js'

export default class DPMCore extends Core {
  #settings
  #options
  constructor($settings = {}, $options = {}) {
    super()
    this.#settings = recursiveAssign({}, Settings, $settings)
    this.#options = recursiveAssign({}, Options, $options)
  }
  get settings() { return this.#settings }
  get options() { return this.#options }
}