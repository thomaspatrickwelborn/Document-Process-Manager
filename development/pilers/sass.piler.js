import Piler from './piler/index.js'
import path from 'node:path'
import createDir from '../coutil/createDir/index.js'
import * as sass from 'sass'
import { stat, mkdir, writeFile } from 'node:fs/promises'
export default class SASSPiler extends Piler {
  constructor() {
    super(...arguments)
  }
  async pile($path) {
    console.log("SassPiler", "$path", $path)
    await createDir(this.settings.output)
    const sourceMapExtension = '.css.map'
    const sassPilePath = this.settings.input
    const sassFilePath = this.settings.output
    const sourceMapFilePath = [
      '.', path.basename(this.settings.output).concat('.map')
    ].join('/')
    const sassFileSourceMapPend = `'\n/*# sourceMappingURL=${sourceMapFilePath} */`
    const sassFileSourceMapPath = this.settings.output.replace(
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
    }
    catch($err) { console.log($err) }
  }
}