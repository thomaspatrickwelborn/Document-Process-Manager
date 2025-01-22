export default class Route extends EventTarget {
  #settings
  #active
  // name
  // url
  #source
  #target
  #main
  #ignore
  constructor($settings) {
    super()
    this.#settings = $settings
  }
  get active() { return this.#active }
  set active($active) { this.#active = $active }
  // get name() {}
  // get url() {}
  get source() {
    if(this.#source !== undefined) { return this.#source }
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
  }
  get target() {
    if(this.#target !== undefined) { return this.#target }
    this.#target = path.join(process.env.PWD, this.#settings.target)
    return this.#target
  }
  get main() {
    if(this.#main !== undefined) { return this.#main }
    this.#main = path.join(process.env.PWD, this.#settings.main)
    return this.#main
  }
  get ignore() {
    if(this.#ignore !== undefined) { return this.#ignore }
    this.#ignore = Array.prototype.concat(this.#settings.ignore)
    return this.#ignore
  }
  get pilers() {}
}
