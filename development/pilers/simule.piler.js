import Piler from './piler/index.js'
import createDir from '../coutil/createDir/index.js'
import micromatch from 'micromatch'
import path from 'node:path'
import { cp, mkdir } from 'node:fs/promises'
export default class SimulePiler extends Piler {
  constructor() {
    super(...arguments)
  }
  async pile($path) {
    console.log("SimulePiler", "$path", $path)
    if(micromatch($path, $settings.input)) {
      if($settings.outputType === 'path') {
        try {
          const createDirPath = path.join($route.target, $settings.output)
          const copyPath = path.join(
            $route.target, $settings.output
          )
          await createDir(createDirPath)
          await cp($path, copyPath, {
            force: true,
            recursive: true,
          })
        }
        catch($err) { console.log($err) }
      }
      else if($settings.outputType === 'glob') {
        try {
          const createDirPath = path.join($route.target, $settings.output)
          const copyPath = $path.replace(
            new RegExp(`^${$route.source}`), 
            $route.target
          )
          await createDir($path)
          await cp($path, copyPath, {
            force: true,
            recursive: true,
          })
        }
        catch($err) { console.log($err) }
      }
    }
  }
}