import path from 'node:path'
import watch from 'glob-watcher'
export default class Processes extends EventTarget {
  length = 0
  #settings
  #dpm
  #source
  #target
  #boundAdd = this.#add.bind(this)
  #boundChange = this.#change.bind(this)
  #boundUnlink = this.#unlink.bind(this)
  #_watchPaths
  #_watcher
  constructor($settings, $dpm) {
    super()
    this.#settings = $settings
    this.#dpm = $dpm
    this.#watcher
  }
  get Subclass() { return this.#settings.Subclass }
  get settings() { return this.#settings }
  get dpm() { return this.#dpm }
  get parent() { return this.dpm }
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
    const processorPath = path.join(process.env.PWD, $path)
    const processorImport = await import(processorPath)
    .then(($processorImport) => $processorImport.default)
    Array.prototype.push.call(this, new this.Subclass(
      Object.assign(processorImport, {
        fileReference: processorPath
      }), this
    ))
    return this
  }
  async #change($path) {
    const processorPath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const processorImport = await import(processorPath)
    .then(($processorImport) => $processorImport.default)
    const [$processorIndex, $processor] = this.getProcesses({ path: processorImport.path })[0]
    $processor.active = false
    delete this[$processorIndex]
    const splicedProcesses = Array.prototype.splice.call(this, $processorIndex, 1, new this.Subclass(
      Object.assign(processorImport, {
        fileReference: processorPath
      }), this
    ))
    return this
  }
  async #unlink($path) {
    const processorPath = path.join(process.env.PWD, $path)
    const [$processorIndex, $processor] = this.getProcesses({ fileReference: processorPath })[0]
    if($processor) {
      $processor.active = false
      Array.prototype.splice.call(this, $processorIndex, 1)
    }
    return this
  }
  getProcesses($filter) {
    const processes = []
    let processorIndex = 0
    iterateProcesses: 
    for(const $processor of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $processor[$filterKey]
        }
      }
      if(match) { processes.push([processorIndex, $processor]) }
      processorIndex++
    }
    return processes
  }
}