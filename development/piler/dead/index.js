import path from 'node:path'
import watch from 'glob-watcher'
export default class Deadpiler extends EventTarget {
  settings
  document
  #ignore
  #path
  #_boundPile
  constructor($settings, $document) {
    super()
    this.settings = $settings
    this.document = $document
  }
  get type() { return this.settings.type }
  get ignore() {
    if(this.#ignore !== undefined) { return this.#ignore }
    this.#ignore = Array.prototype.concat(
      // Settings - Ignore
      this.settings.ignore.map(
        ($ignorePath) => path.join(this.document.source, $ignorePath)
      ),
      // Route - Ignore
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
  get #boundPile() {
    if(this.#_boundPile !== undefined) { return this.#_boundPile }
    this.#_boundPile = this.pile.bind(this)
    return this.#_boundPile
  }
}