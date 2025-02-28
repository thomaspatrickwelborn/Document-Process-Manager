import { Core } from 'core-plex'
import path from 'node:path'
import watch from 'glob-watcher'
export default class Processes extends Core {
  length = 0
  #settings
  #parent
  #source
  #target
  #boundAdd = this.#add.bind(this)
  #boundChange = this.#change.bind(this)
  #boundUnlink = this.#unlink.bind(this)
  #_watchPaths
  #_watcher
  constructor($settings, $options, $parent) {
    super(...arguments)
    this.#parent = $parent
    this.#watcher
  }
  get Subclass() { return this.settings.Subclass }
  get parent() { return this.#parent }
  get #config() { return this.settings.config }
  get source() {
    if(this.settings.source !== undefined) return this.settings.source
    this.#source = path.join(process.env.PWD, this.settings.source)
    return this.#source
  }
  get target() {
    if(this.settings.target !== undefined) return this.settings.target
    this.#target = path.join(process.env.PWD, this.settings.target)
    return this.#target
  }
  get #watchPaths() {
    if(this.#_watchPaths !== undefined) { return this.#_watchPaths }
    this.#_watchPaths = []
    for(const $config of [].concat(this.#config)) {
      const watchPath = `${this.source}/**/${$config}`
      this.#_watchPaths.push(watchPath)
    }
    return this.#_watchPaths
  }
  get #watcher() {
    if(this.#_watcher !== undefined) { return this.#_watcher }
    const watcher = watch(this.#watchPaths, {
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
    const processPath = path.join(process.env.PWD, $path)
    const processImport = await import(processPath)
    .then(($processImport) => $processImport.default)
    Array.prototype.push.call(this, new this.Subclass(
      Object.assign(processImport, {
        fileReference: processPath
      }), {}, this
    ))
    return this
  }
  async #change($path) {
    const processPath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const processImport = await import(processPath)
    .then(($processImport) => $processImport.default)
    const [$processIndex, $process] = this.getProcesses({ path: processImport.path })[0]
    $process.active = false
    delete this[$processIndex]
    const splicedProcesses = Array.prototype.splice.call(this, $processIndex, 1, new this.Subclass(
      Object.assign(processImport, {
        fileReference: processPath
      }), {}, this
    ))
    return this
  }
  async #unlink($path) {
    const processPath = path.join(process.env.PWD, $path)
    const [$processIndex, $process] = this.getProcesses({ fileReference: processPath })[0]
    if($process) {
      $process.active = false
      Array.prototype.splice.call(this, $processIndex, 1)
    }
    return this
  }
  getProcesses($filter) {
    const processes = []
    let processIndex = 0
    iterateProcesses: 
    for(const $process of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $process.settings[$filterKey]
        }
      }
      if(match) { processes.push([processIndex, $process]) }
      processIndex++
    }
    return processes
  }
}