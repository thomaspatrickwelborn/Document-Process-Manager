import path from 'node:path'
import watch from 'glob-watcher'
export default class Adpiler extends EventTarget {
  settings
  document
  #active = false
  #input
  #output
  #watch
  #ignore
  #watcher
  #_boundPile
  constructor($settings, $document) {
    super()
    this.settings = $settings
    this.document = $document
  }
  get active() { return this.#active }
  set active($active) {
    if(this.#active === $active) { return }
    if(this.watcher !== undefined) {
      if($active === true) {
        this.watcher
      }
      else if($active === false) {
        this.watcher.close()
        this.#watcher = undefined
      }
    }
    this.#active = $active
  }
  get type() { return this.settings.type }
  get input() {
    if(this.#input !== undefined) { return this.#input }
    this.#input = path.join(this.document.source, this.settings.input)
    return this.#input
  }
  get output() {
    if(this.#output !== undefined) { return this.#output }
    this.#output = path.join(this.document.target, this.settings.output)
    return this.#output
  }
  get watch() {
    if(this.#watch !== undefined) { return this.#watch }
    if(!this.settings.watch) { return this.#watch }
    const watch = this.settings.watch.map(
      ($watchPath) => path.join(this.document.source, $watchPath)
    )
    if(watch.length) { this.#watch = watch }
    return this.#watch
  }
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
  get watcher() {
    if(this.#watcher !== undefined) { return this.#watcher }
    if(this.watch === undefined) { return this.#watcher }
    let watcher = watch(this.watch, {
      ignored: this.ignore,
      ignoreInitial: false,
      awaitWriteFinish: true,
    })
    watcher.on('add', ($path, $stats) => this.#boundPile($path))
    watcher.on('change', ($path, $stats) => this.#boundPile($path))
    this.#watcher = watcher
    return this.#watcher
  }
  get #boundPile() {
    if(this.#_boundPile !== undefined) { return this.#_boundPile }
    this.#_boundPile = this.pile.bind(this)
    return this.#_boundPile
  }
}