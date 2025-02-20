import * as Pilers from '../../pilers/index.js'
import path from 'node:path'
import { rm } from 'node:fs/promises'
import Core from '../../core/index.js'
const PilerTypes = [
  'sans',
  'simules',
  'styles',
  'scripts',
  'structs',
]
export default class DPMDocument extends Core {
  #pilers
  #source
  #target
  #ignore
  #active = false
  constructor($settings, $documents) {
    super(...arguments)
    this.#depile().then(($depile) => {
      this.active = this.settings.active
    })
  }
  get active() { return this.#active }
  set active($active) {
    let { promise, resolve, reject } = Promise.withResolvers()
    if($active === true) {
      this.#addPilers().then(() => {
        resolve($active)
        this.#active = $active
      })
    }
    else if($active === false) {
      this.#removePilers().then(() => {
        resolve($active)
        this.#active = $active
      })
    }
    this.#active = promise
  }
  get name() { return this.settings.name }
  get fileReference() { return this.settings.fileReference }
  get path() { return this.settings.path }
  get source() {
    if(this.#source !== undefined) return this.#source
    this.#source = path.join(process.env.PWD, this.settings.source)
    return this.#source
  }
  get target() {
    if(this.#target !== undefined) return this.#target
    this.#target = path.join(process.env.PWD, this.settings.target)
    return this.#target
  }
  get main() { return this.settings.main }
  get ignore() {
    if(this.#ignore !== undefined) { return this.#ignore }
    this.#ignore = this.settings.ignore.map(
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
    iteratePilerTypes: 
    for(const $pilerType of PilerTypes) {
      const pilers = []
      iteratePilerSettings: 
      if(this.settings.pilers[$pilerType] === undefined) { continue iteratePilerTypes }
      for(const $piler of this.settings.pilers[$pilerType]) {
        if($pilerType === 'sans') { continue iteratePilerTypes}
        this.pilers[$pilerType] = this.pilers[$pilerType] || []
        const Piler = Pilers[$piler.name]
        const piler = new Piler($piler, this)
        piler.active = true
        this.pilers[$pilerType].push(piler)
      }
    }
    return this
  }
  async #removePilers() {
    iteratePilerTypes: 
    for(const $pilerType of PilerTypes) {
      if($pilerType === 'sans') { continue iteratePilerTypes }
      const pilers = this.pilers[$pilerType]
      if(pilers && pilers.length) {
        let pilerIndex = 0
        iteratePilers: 
        for(const $piler of pilers) {
          $piler.active = false
          pilers.splice(pilerIndex, 1)
          pilerIndex++
        }
      }
    }
    return this
  }
  #depile() {
    const depile = []
    iterateSansPilers: 
    for(const $sansPiler of this.settings.pilers.sans || []) {
      if($sansPiler.name === "ClearPiler") {
        const clearPiler = new Pilers.ClearPiler($sansPiler, this)
        depile.push(clearPiler.pile())
      }
    }
    return Promise.all(depile)
  }
}