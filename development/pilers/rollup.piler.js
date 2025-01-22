import path from 'node:path'
import * as rollup from 'rollup'
import createDir from '../coutil/createDir/index.js'
export default async function RollupPiler($settings, $route, $path) {
  console.log("RollupPiler", "$path", $path)
  await createDir($settings.output)
  try {
    const inputPath = path.join($route.source, $settings.input)
    const rollupPile = await rollup.rollup({
      external: $settings.external,
      input: inputPath,
    })
    const rollupFilePath = path.join($route.target, $settings.output)
    await rollupPile.write({
      file: rollupFilePath,
      format: 'es',
      sourcemap: true
    })
  }
  catch($err) { console.log($err) }
}