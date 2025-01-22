import path from 'node:path'
import createDir from '../coutil/createDir/index.js'
import * as sass from 'sass'
import { stat, mkdir, writeFile } from 'node:fs/promises'
export default async function SassPiler($settings, $route, $path) {
  console.log("SassPiler", "$path", $path)
  await createDir($settings.output)
  const sourceMapExtension = '.css.map'
  const sassPilePath = path.join(process.env.PWD, $route.source, $settings.input)
  const sassFilePath = path.join(process.env.PWD, $route.target, $settings.output)
  const sourceMapFilePath = [
    '.', path.basename($settings.output).concat('.map')
  ].join('/')
  const sassFileSourceMapPend = `'\n/*# sourceMappingURL=${sourceMapFilePath} */`
  const sassFileSourceMapPath = $settings.output.replace(
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