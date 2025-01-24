import Route from './route/index.js'
import * as Pilers from '../../pilers/index.js'
import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
const PilerTypes = [
  'sans',
  'simules',
  'styles',
  'scripts',
  'structs',
]
export default class Section extends EventTarget {
  #settings
  #sections
  #pilers
  #active = false
  #source
  #target
  #ignore
  #depiled = false
  constructor($settings, $sections) {
    super()
    this.#settings = $settings
    this.#sections = $sections
    this.active = this.#settings.active
  }
  get active() { return this.#active }
  set active($active) {
    if(this.#active === $active) { return }
    if($active === true) { this.#addPilers() }
    else if($active === false) { this.#removePilers() }
    this.#active = $active
  }
  get name() { return this.#settings.name }
  get url() { return this.#settings.url }
  get source() {
    if(this.#source !== undefined) return this.#source
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
  }
  get target() {
    if(this.#target !== undefined) return this.#target
    this.#target = path.join(process.env.PWD, this.#settings.target)
    return this.#target
  }
  get main() { return this.#settings.main }
  get ignore() {
    if(this.#ignore !== undefined) { return this.#ignore }
    this.#ignore = this.#settings.ignore.map(
      ($ignorePath) => path.join(this.source, $ignorePath)
    )
    return this.#ignore
  }
  get pilers() {
    if(this.#pilers !== undefined) { return this.#pilers }
    this.#pilers = {}
    return this.#pilers
  }
  async #addPilers() {
    await this.#depile()
    iteratePilerTypes: 
    for(const $pilerType of PilerTypes) {
      const pilers = []
      iteratePilerSettings: 
      for(const $piler of this.#settings.pilers[$pilerType]) {
        this.pilers[$pilerType] = this.pilers[$pilerType] || []
        const Piler = Pilers[$piler.name]
        const piler = new Piler($piler, this)
        piler.active = true
        this.pilers[$pilerType].push(piler)
        if(piler.type === 'sans') {
          await piler.pile()
        }
      }
    }
    return this
  }
  async #removePilers() {
    iteratePilerTypes: 
    for(const $pilerType of PilerTypes) {
      const pilers = this.pilers[$pilerType]
      let pilerIndex = 0
      iteratePilers: 
      for(const $piler of pilers) {
        $piler.active = false
        pilers.splice($pilerIndex, 1)
        pilerIndex++
      }
    }
    await this.#depile()
    return this
  }
  async #depile() {
    if(this.#depiled) { return this } 
    iterateSansPilers: 
    for(const $pilerInstance of this.pilers.sans || []) {
      await $pilerInstance.pile()
    }
    this.#depiled = true
    return this
  }
}