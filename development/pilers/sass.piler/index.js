import path from 'node:path'
import { stat, mkdir, writeFile } from 'node:fs/promises'
import * as sass from 'sass'
import createDir from '../../coutil/createDir/index.js'
import Piler from '../../piler/ad/index.js'
import OutputOptions from './OutputOptions.js'
export default class SASSPiler extends Piler {
  constructor() {
    super(...arguments)
  }
  async pile($path) {
    await createDir(this.output)
    const sourceMapExtension = '.css.map'
    const sassPilePath = this.input
    const sassFilePath = this.output
    const sourceMapFilePath = [
      '.', path.basename(this.output).concat('.map')
    ].join('/')
    const sassFileSourceMapPend = `'\n/*# sourceMappingURL=${sourceMapFilePath} */`
    const sassFileSourceMapPath = this.output.replace(
      new RegExp(/\.css$/), sourceMapExtension
    )
    try {
      const sassPile = sass.compile(sassPilePath, {
        sourceMap: true,
        sourceMapIncludeSources: true,
        stopOnError: false, 
        errorCSS: false,
      })
      const sassFileCSS = sassPile.css.concat(sassFileSourceMapPend)
      const sassFileSourceMap =JSON.stringify(sassPile.sourceMap)
      await writeFile(sassFilePath, sassFileCSS)
      await writeFile(sassFileSourceMapPath, sassFileSourceMap)
      return sassFileCSS
    }
    catch($err) {
      if(this.document.parent.logErrors) console.error($err) 
    }
  }
}