import Piler from '../../piler/ad/index.js'
import createDir from '../../coutil/createDir/index.js'
import micromatch from 'micromatch'
import path from 'node:path'
import { cp, mkdir } from 'node:fs/promises'
export default class SimulePiler extends Piler {
  constructor() {
    super(...arguments)
    // this.watcher
  }
  async pile($path) {
    if(micromatch($path, this.input)) {
      if(this.settings.outputType === 'path') {
        try {
          const createDirPath = this.output
          const copyPath = this.output
          await createDir(createDirPath)
          await cp($path, copyPath, {
            force: true,
            recursive: true,
          })
        }
        catch($err) { console.error($err) }
      }
      else if(this.settings.outputType === 'glob') {
        try {
          const createDirPath = this.output
          const copyPath = $path.replace(
            new RegExp(`^${this.document.source}`), 
            this.document.target
          )
          await createDir($path)
          await cp($path, copyPath, {
            force: true,
            recursive: true,
          })
        }
        catch($err) { console.error($err) }
      }
    }
  }
}