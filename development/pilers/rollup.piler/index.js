import path from 'node:path'
import * as rollup from 'rollup'
import Piler from '../../piler/index.js'
import createDir from '../../coutil/createDir/index.js'
import parseValidProperties from '../../coutil/parseValidProperties/index.js'
import InputOptions from './InputOptions.js'
import OutputOptions from './OutputOptions.js'

export default class RollupPiler extends Piler{
  #inputOptions
  #outputOptions
  constructor() {
    super(...arguments)
    this.watcher
  }
  get inputOptions() {
    if(
      this.#inputOptions !== undefined ||
      this.settings.inputOptions === undefined
    ) { return this.#inputOptions }
    this.#inputOptions = parseValidProperties(this.settings.inputOptions, InputOptions)
    return this.#inputOptions
  }
  get outputOptions() {
    if(
      this.#outputOptions !== undefined ||
      this.settings.outputOptions === undefined
    ) { return this.#outputOptions }
    this.#outputOptions = parseValidProperties(this.settings.outputOptions, OutputOptions)
    return this.#outputOptions
  }
  async pile($path) {
    await createDir(this.output)
    try {
      const inputOptions = Object.assign({}, this.inputOptions, {
        input: this.input
      })
      const outputOptions = Object.assign({}, this.outputOptions, {
        file: this.output
      })
      const rollupPile = await rollup.rollup(inputOptions)
      await rollupPile.write(outputOptions)
    }
    catch($err) { console.log($err) }
  }
}