import { Core } from 'core-plex'
import path from 'node:path'
export default class Deadpiler extends Core {
  document
  #ignore
  #path
  #boundPile = this.pile.bind(this)
  constructor($settings, $options, $document) {
    super(...arguments)
    this.document = $document
  }
  get type() { return this.settings.type }
  get ignore() {
    if(this.#ignore !== undefined) { return this.#ignore }
    this.#ignore = Array.prototype.concat(
      this.settings.ignore.map(
        ($ignorePath) => path.join(this.document.source, $ignorePath)
      ),
      this.document.ignore
    )
    return this.#ignore
  }
  get path() {
    if(this.#path !== undefined) { return this.#path }
    this.#path = this.settings.path.map(
      ($path) => path.join(this.document[this.settings.target], $path)
    )
    return this.#path
  }
}