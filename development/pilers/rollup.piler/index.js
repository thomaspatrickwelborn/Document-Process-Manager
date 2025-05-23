import path from 'node:path'
import { stat, mkdir, writeFile } from 'node:fs/promises'
import * as rollup from 'rollup'
import Piler from '../../piler/ad/index.js'
import createDir from '../../coutil/createDir/index.js'
import parseValidProperties from '../../coutil/parseValidProperties/index.js'
import InputOptions from './InputOptions.js'
import OutputOptions from './OutputOptions.js'

export default class RollupPiler extends Piler{
  #inputOptions
  #outputOptions
  constructor() {
    super(...arguments)
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
      const outputOptions = Object.assign({}, this.outputOptions, {})
      const rollupPile = await rollup.rollup(inputOptions)
      const rollupPileOutput = await rollupPile.generate(outputOptions)
      const rollupFile = rollupPileOutput.output[0].code
      const rollupFileMap = rollupPileOutput.output[0].map
      writeFile(this.output, rollupFile)
      if(this.outputOptions.sourcemap === true) {
        writeFile(this.output.concat('.map'), JSON.stringify(rollupFileMap))
      }
      return rollupFile
    }
    catch($err) { console.error($err) }
  }
}