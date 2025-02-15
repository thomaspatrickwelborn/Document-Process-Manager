import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
export default class Process extends EventTarget {
  length = 0
  #settings
  #dpm
  #Class
  #source
  #target
  #_watcher
  #boundAdd = this.#add.bind(this)
  #boundChange = this.#change.bind(this)
  #boundUnlink = this.#unlink.bind(this)
  constructor($settings, $dpm, $Class) {
    super()
    this.#settings = $settings
    this.#dpm = $dpm
    this.#Class = $Class
    this.#watcher
  }
  get parent() { return this.#dpm }
  get #config() { return this.#settings.config }
  get source() {
    if(this.#settings.source !== undefined) return this.#settings.source
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
  }
  get target() {
    if(this.#settings.target !== undefined) return this.#settings.target
    this.#target = path.join(process.env.PWD, this.#settings.target)
    return this.#target
  }
  get #watcher() {
    if(this.#_watcher !== undefined) { return this.#_watcher }
    const watchPath = `${this.source}/**/${this.#config}`
    const watcher = watch(watchPath, {
      ignoreInitial: false,
      awaitWriteFinish: true,
    })
    watcher.on('add', this.#boundAdd)
    watcher.on('change', this.#boundChange)
    watcher.on('unlink', this.#boundUnlink)
    this.#_watcher = watcher
    return this.#_watcher
  }
  async #add($path) {
    const addPath = path.join(process.env.PWD, $path)
    const processImport = await import(addPath)
    .then(($processImport) => $processImport.default)
    Array.prototype.push.call(this, new this.#Class(Object.assign(
      processImport, { fileReference: addPath }
    )))
    return this
  }
  async #change($path) {
    const changePath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const processImport = await import(changePath)
    .then(($processImport) => $processImport.default)
    const preterProcess = this.get({ path: processImport.path })
    if(preterProcess.length) {
      const [$processIndex, $process] = preterProcess[0]
      $process.active = false
      await $process.active
      const anterProcess = new this.#Class(Object.assign(
        processImport, { fileReference: changePath }
      ))
      Array.prototype.splice.call(this, $processIndex, 1, anterProcess)
    }
    return this
  }
  async #unlink($path) {
    const unlinkPath = path.join(process.env.PWD, $path)
    const [$processIndex, $process] = this.get({ fileReference: unlinkPath })[0]
    if($process) {
      $process.active = false
      await $process.active
      Array.prototype.splice.call(this, $processIndex, 1)
    }
    return this
  }
  get($filter) {
    const processes = []
    let processIndex = 0
    iterateProcesses: 
    for(const $process of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $process[$filterKey]
        }
      }
      if(match) { processes.push([processIndex, $process]) }
      processIndex++
    }
    return processes
  }
}