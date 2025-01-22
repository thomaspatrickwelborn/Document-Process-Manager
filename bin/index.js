#!/usr/bin/env node
import path from 'node:path'
import inspector from 'node:inspector'
import { readFile } from 'node:fs/promises'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import DocumentProcessManager from '../development/index.js'
const argv = yargs(hideBin(process.argv)).argv
/*
if(argv.inspect) {
  if(typeof argv.inspect === 'boolean') {
    inspector.open()
  } else {
    const [$host, $port] = argv.inspect.split(':')
    if($host && $port) {
      inspector.open($port, $host)
    } else
    if($host) {
      inspector.open(null, $host)
    }
  } 
}
*/
// Config Path
if(argv.config) {
  const configPath = path.join(
    process.env.PWD,
    argv.config
  )
  const configFile = await readFile(configPath)
  .then(($file) => JSON.parse($file))
  const documentProcessManager = new DocumentProcessManager(configFile)
}
