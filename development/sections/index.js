import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
import Section from './section/index.js'
export default class Sections extends EventTarget {
  length = 0
  #settings
  #_watcher
  #source
  #target
  #_boundAdd
  #_boundChange
  #_boundUnlink
  constructor($settings) {
    super()
    this.#settings = $settings
    this.#watcher
    console.log(this)
  }
  get source() {
    if(this.#settings.source !== undefined) return this.#settings.source
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
  }
  get target() {
    if(this.#settings.target !== undefined) return this.#settings.target
    this.#target = path.join(process.env.PWD, this.#settings.target)
    return this.#target
  }
  get #key() { return this.#settings.key }
  get #watcher() {
    if(this.#_watcher !== undefined) { return this.#_watcher }
    const watchPath = `${this.source}/**/${this.#key}`
    const watcher = watch(watchPath, {
      ignoreInitial: false,
      awaitWriteFinish: true,
    })
    watcher.on('add', this.#boundAdd)
    watcher.on('change', this.#boundChange)
    watcher.on('unlink', this.#boundUnlink)
    this.#_watcher = watcher
    return this.#_watcher
  }
  get #boundAdd() {
    if(this.#_boundAdd !== undefined) { return this.#_boundAdd}
    this.#_boundAdd = this.#add.bind(this)
    return this.#_boundAdd
  }
  get #boundChange() {
    if(this.#_boundChange !== undefined) { return this.#_boundChange}
    this.#_boundChange = this.#change.bind(this)
    return this.#_boundChange
  }
  get #boundUnlink() {
    if(this.#_boundUnlink !== undefined) { return this.#_boundUnlink}
    this.#_boundUnlink = this.#unlink.bind(this)
    return this.#_boundUnlink
  }
  async #add($path) {
    const sectionPath = path.join(process.env.PWD, $path)
    const sectionImport = await import(sectionPath)
    .then(($sectionImport) => $sectionImport.default)
    Array.prototype.push.call(this, new Section(sectionImport))
      return this
  }
  async #change($path) {
    // console.log("#change", "$path", $path)
    return this
  }
  async #unlink($path) {
    // console.log("#unlink", "$path", $path)
    return this
  }
  get($filter) {
    const sections = []
    const filterKeys = Object.keys($filter)
    for(const $section of Array.from(this)) {
      
    }
    return sections
  }
}