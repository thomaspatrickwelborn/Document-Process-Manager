import Core from '../../core/index.js'
import path from 'node:path'
import watch from 'glob-watcher'
export default class Adpiler extends Core {
  document
  #active = false
  #input
  #output
  #watch
  #ignore
  #watcher
  constructor($settings, $options, $document) {
    super(...arguments)
    this.document = $document
    this.addEvents([
      // Watcher Events
      {
        path: 'watcher', type: 'add',
        listener: this.pile.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      {
        path: 'watcher', type: 'change',
        listener: this.pile.bind(this),
        target: { assign: 'on', deassign: 'off' },
      }
    ])
    Object.defineProperties(this, {
      watcher: {
        enumerable: true,
        get() {
          if(this.#watcher !== undefined) { return this.#watcher }
          if(this.watch === undefined) { return this.#watcher }
          let watcher = watch(this.watch, {
            ignored: this.ignore,
            ignoreInitial: false,
            awaitWriteFinish: true,
          })
          this.#watcher = watcher
          this.enableEvents({ path: 'watcher' })
          return this.#watcher
        }
      }
    })
    this.watcher
    this.enableEvents()
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
      this.settings.ignore.map(
        ($ignorePath) => path.join(this.document.source, $ignorePath)
      ),
      this.document.ignore
    )
    return this.#ignore
  }
  
}