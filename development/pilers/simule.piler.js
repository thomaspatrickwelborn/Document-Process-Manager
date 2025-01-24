import Piler from './piler/index.js'
import createDir from '../coutil/createDir/index.js'
import micromatch from 'micromatch'
import path from 'node:path'
import { cp, mkdir } from 'node:fs/promises'
export default class SimulePiler extends Piler {
  constructor() {
    super(...arguments)
    this.watcher
  }
  async pile($path) {
    if(micromatch($path, this.settings.input)) {
      if(this.settings.outputType === 'path') {
        try {
          const createDirPath = path.join(this.section.target, this.settings.output)
          const copyPath = path.join(
            this.section.target, this.settings.output
          )
          await createDir(createDirPath)
          await cp($path, copyPath, {
            force: true,
            recursive: true,
          })
        }
        catch($err) { console.log($err) }
      }
      else if(this.settings.outputType === 'glob') {
        try {
          const createDirPath = path.join(this.section.target, this.settings.output)
          const copyPath = $path.replace(
            new RegExp(`^${this.section.source}`), 
            this.section.target
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