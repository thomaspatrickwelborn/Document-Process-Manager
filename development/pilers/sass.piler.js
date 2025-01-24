import Piler from './piler/index.js'
import path from 'node:path'
import createDir from '../coutil/createDir/index.js'
import * as sass from 'sass'
import { stat, mkdir, writeFile } from 'node:fs/promises'
export default class SASSPiler extends Piler {
  constructor() {
    super(...arguments)
    this.watcher
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
    }
    catch($err) { console.log($err) }
  }
}