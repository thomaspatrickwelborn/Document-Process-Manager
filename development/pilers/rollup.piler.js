import Piler from './piler/index.js'
import path from 'node:path'
import * as rollup from 'rollup'
import createDir from '../coutil/createDir/index.js'
export default class RollupPiler extends Piler{
  constructor() {
    super(...arguments)
  }
  async pile($path) {
    await createDir($settings.output)
    try {
      const inputPath = path.join(this.section.source, this.settings.input)
      const rollupPile = await rollup.rollup({
        external: $settings.external,
        input: inputPath,
      })
      const rollupFilePath = path.join(this.section.target, this.settings.output)
      await rollupPile.write({
        file: rollupFilePath,
        format: 'es',
        sourcemap: true
      })
    }
    catch($err) { console.log($err) }
  }
}