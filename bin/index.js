#!/usr/bin/env node
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import DocumentProcessManager from '../development/index.js'
const argv = yargs(hideBin(process.argv)).argv
if(argv.config) {
  const configPath = path.join(
    process.env.PWD,
    argv.config
  )
  const configFile = await import(configPath).then(($module) => $module.default)
  const documentProcessManager = new DocumentProcessManager(configFile)
}
