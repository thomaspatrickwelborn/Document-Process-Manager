import path from 'node:path'
import { globSync } from 'glob'
import Piler from '../../piler/dead/index.js'
import { rm, rmdir, readdir } from 'node:fs/promises'
export default class ClearPiler extends Piler {
  #target
  #path
  #ignore
  constructor($settings, $options, $document) {
    super(...arguments)
  }
  get target() {
    if(this.#target !== undefined) { return this.#target }
    this.#target = this.document[this.settings.target]
    return this.#target
  }
  get path() {
    if(this.#path !== undefined) return this.#path
    this.#path = this.settings.path.map(
      ($clearTargetPath) => path.join(this.target, $clearTargetPath)
    )
    return this.#path
  }
  get ignore() {
    if(this.#ignore !== undefined) { return this.#ignore }
    this.#ignore = Array.prototype.concat(
      // Settings - Ignore
      this.settings.ignore.map(
        ($ignorePath) => path.join(this.target, $ignorePath)
      ),
      // Route - Ignore
      this.document.ignore
    )
    return this.#ignore
  }
  get #depilePaths() {
    const depilePaths = globSync(this.path, {
      ignore: this.ignore
    })
    return depilePaths
  }
  async pile() {
    let depile = []
    const depilePaths = this.#depilePaths
    const depilePathDirectories = []
    iterateDepilePaths: 
    for(const $depilePath of depilePaths) {
      const depilePathDirectory = path.dirname($depilePath)
      if(depilePathDirectories.includes(depilePathDirectory) === false) {
        depilePathDirectories.push(depilePathDirectory)
      }
      const removeFile = await rm($depilePath, { force: true })
      depile = depile.concat(depile)
    }
    return depile
  }
}