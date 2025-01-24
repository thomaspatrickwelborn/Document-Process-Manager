import Piler from './piler/index.js'
import path from 'node:path'
import * as rollup from 'rollup'
import createDir from '../coutil/createDir/index.js'
export default class RollupPiler extends Piler{
  constructor() {
    super(...arguments)
    this.watcher
  }
  async pile($path) {
    await createDir(this.output)
    try {
      const inputPath = this.input
      const rollupPile = await rollup.rollup({
        external: this.settings.external,
        input: inputPath,
      })
      const rollupFilePath = this.output
      await rollupPile.write({
        file: rollupFilePath,
        format: 'es',
        sourcemap: true
      })
    }
    catch($err) { console.log($err) }
  }
}