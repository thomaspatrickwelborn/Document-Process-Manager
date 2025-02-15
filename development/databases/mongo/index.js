export default class MongoDatabases extends EventTarget {
  length = 0
  #settings
  #dpm
  #source
  #boundAdd = this.#add.bind(this)
  #boundChange = this.#change.bind(this)
  #boundUnlink = this.#unlink.bind(this)
  #_watcher
  constructor($settings) {
    super()
    this.#settings = $settings
    this.#dpm = $dpm
    this.#watcher
    console.log(this)
  }
  get parent() { return this.#dpm }
  get #config() { return this.#settings.config }
  get source() {
    if(this.#settings.source !== undefined) return this.#settings.source
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
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
    const databasePath = path.join(process.env.PWD, $path)
    const databaseImport = await import(databasePath)
    .then(($databaseImport) => $databaseImport.default)
    Array.prototype.push.call(this, new Socket(
      Object.assign(databaseImport, {
        fileReference: databasePath
      }), this
    ))
    return this
  }
  async #change($path) {
    const databasePath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const databaseImport = await import(databasePath)
    .then(($databaseImport) => $databaseImport.default)
    const [$databaseIndex, $database] = this.getDatabases({ path: databaseImport.path })[0]
    $database.active = false
    delete this[$databaseIndex]
    const splicedDatabases = Array.prototype.splice.call(this, $databaseIndex, 1, new Database(
      Object.assign(databaseImport, {
        fileReference: databasePath
      }), this
    ))
    return this
  }
  async #unlink($path) {
    const databasePath = path.join(process.env.PWD, $path)
    const [$databaseIndex, $database] = this.getDatabases({ fileReference: databasePath })[0]
    if($database) {
      $database.active = false
      Array.prototype.splice.call(this, $databaseIndex, 1)
    }
    return this
  }
  getDatabases($filter) {
    const databases = []
    let databaseIndex = 0
    iterateDatabases: 
    for(const $database of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $database[$filterKey]
        }
      }
      if(match) { databases.push([databaseIndex, $database]) }
      databaseIndex++
    }
    return databases
  }
}