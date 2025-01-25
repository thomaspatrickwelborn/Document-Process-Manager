import path from 'node:path'
import { globSync } from 'glob'
import Piler from '../../piler/index.js'
import { rm } from 'node:fs'
export default class ClearPiler extends Piler {
  #target
  #path
  constructor() {
    super(...arguments)
  }
  get target() {
    if(this.#target !== undefined) { return this.#target }
    this.#target = this.route[this.settings.target]
    return this.#target
  }
  get path() {
    if(this.#path !== undefined) return this.#path
    this.#path = this.settings.path.map(
      ($clearTargetPath) => path.join(this.target, $clearTargetPath)
    )
    return this.#path
  }
  async pile() {
    const clear = []
    const depilePaths = globSync(this.path, {
      ignore: this.ignore
    })
    for(const $depilePath of depilePaths) {
      clear.push(
        new Promise(($resolve, $reject) => {
          rm($depilePath, {
            recursive: true,
            force: true,
          }, ($err) => {
            if($err) { $reject($err) }
            else { $resolve(true) }
          })
          $resolve(true)
        })
      )
    }
    return Promise.all(clear)
  }
}