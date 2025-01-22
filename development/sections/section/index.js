import Route from './route/index.js'
import * as Pilers from '../../pilers/index.js'
import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
export default class Section extends EventTarget {
  length = 0
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
    this.#ignore = Array.prototype.concat(
      // Settings - Ignore
      this.settings.ignore.map(
        ($ignorePath) => path.join(this.section.source, $ignorePath)
      ),
      // Section - Ignore
      this.section.ignore.map(
        ($ignorePath) => path.join(this.section.source, $ignorePath)
      )
    )
    return this.#ignore
  }
  get pilers() { return Object.fromEntries(Array.from(this)) }
  async #addPilers() {
    iteratePilers: 
    for(const $piler of [
      'sans',
      // 'simules',
      // 'styles',
      // 'scripts',
      // 'structs'
    ]) {
      const pilers = []
      iteratePilerSettings: 
      for(const $pilers of this.#settings.pilers[$piler]) {
        const pilerName = $pilers.name
        const pilersIndex = pilers.findIndex(
          ([$pilerName, $pilers]) => $pilerName === pilerName
        )
        const Piler = Pilers[$pilers.name]
        const piler = new Piler($pilers, this)
        if(pilersIndex === -1) {
          pilers.push([pilerName, [piler]])
        }
        else {
          pilers[pilersIndex][1].push(piler)
        }
      }
      Array.prototype.push.call(this, ...pilers)
    }
    return this.#depile()
  }
  async #removePilers() {
    return await this.#depile()
  }
  async #depile() {
    if(this.#depiled) { return this } 
    iteratePilers: 
    for(const $pilerInstances of Object.values(this.pilers)) {
      iteratePilerInstances: 
      for(const $pilerInstance of $pilerInstances) {
        if($pilerInstance.type === '  ') {
          await $pilerInstance.pile()
        }
      }
    }
    this.#depiled = true
    return this
  }
}