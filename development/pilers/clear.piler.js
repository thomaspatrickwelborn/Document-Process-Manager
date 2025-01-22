import path from 'node:path'
import Piler from './piler/index.js'
export default class ClearPiler extends Piler {
  #target
  #path
  constructor($settings, $section) {
    super(...arguments)
  }
  get target() {
    if(this.#target !== undefined) { return this.#target }
    this.#target = path.join(this.section[this.settings.target])
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
    console.log("depilePaths", depilePaths)
    for(const $depilePath of depilePaths) {
      clear.push(
        new Promise(($resolve, $reject) => {
          // rm($depilePath, {
          //   recursive: true,
          //   force: true,
          // }, ($err) => {
          //   if($err) { $reject($err) }
          //   else { $resolve(true) }
          // })
          console.log($depilePath)
          $resolve(true)
        })
      )
    }
    // return Promise.all(clear)
    return Promise.all([])
  }
}