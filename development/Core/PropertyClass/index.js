import Handler from './Handler/index.js'
export default class PropertyClass {
  #settings
  #core
  #target
  #handler
  #proxy
  constructor($settings, $core) {
    this.#settings = $settings
    this.core = $core
    if([
      this.ID, this.Name, this.Class, 
      this.Names.Monople.Formal, this.Names.Monople.Nonformal,
      this.Names.Multiple.Formal, this.Names.Multiple.Nonformal,
    ].includes(undefined)) { return undefined }
    return this.proxy
  }
  get core() { return this.#core }
  set core($core) {
    if(this.#core !== undefined) return
    this.#core = $core
  }
  get target() {
    if(this.#target !== undefined) { return this.#target }
    this.#target = {}
    return this.#target
  }
  get handler() {
    if(this.#handler !== undefined) { return this.#handler }
    this.#handler = new Handler(this)
    return this.#handler
  }
  get proxy() {
    if(this.#proxy !== undefined) { return this.#proxy }
    this.#proxy = new Proxy(this.target, this.handler)
    return this.#proxy
  }
  get ID() { return this.#settings.ID }
  get Name() { return this.#settings.Name }
  get Class() { return this.#settings.Class }
  get ClassInstantiator() { return this.#settings.ClassInstantiator }
  get ClassDeinstantiator() { return this.#settings.ClassDeinstantiator }
  get Names() { return this.#settings.Names }
  get Events() { return this.#settings.Events }
}