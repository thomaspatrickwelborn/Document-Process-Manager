import Core from '../core/index.js'
import path from 'node:path'
import watch from 'glob-watcher'
export default class Processes extends Core {
  length = 0
  #parent
  #source
  #target
  #_watchPaths
  #watcher
  constructor($settings, $options, $parent) {
    super(...arguments)
    this.#parent = $parent
    this.addEvents([
      // Watcher Add
      {
        path: 'watcher', type: 'add',
        listener: async function watcherAdd($path) {
          const processPath = path.join(process.env.PWD, $path)
          const processImport = await import(processPath)
          .then(($processImport) => $processImport.default)
          Array.prototype.push.call(this, new this.Subclass(
            Object.assign(processImport, {
              fileReference: processPath
            }), {}, this
          ))
          return this
        }.bind(this),
        assign: 'on', deassign: 'off',
      },
      // Watcher Change
      {
        path: 'watcher', type: 'change', 
        listener: async function watcherChange($path) {
          const processPath = path.join(process.env.PWD, $path).concat('?', Date.now())
          const processImport = await import(processPath)
          .then(($processImport) => $processImport.default)
          const processes = this.getProcesses({ fileReference: processPath })
          if(processes.length) {
            const [$processIndex, $process] = processes[0]
            $process.active = false
            delete this[$processIndex]
            const splicedProcesses = Array.prototype.splice.call(this, $processIndex, 1, new this.Subclass(
              Object.assign(processImport, {
                fileReference: processPath
              }), {}, this
            ))
          }
          return this
        }.bind(this),
        assign: 'on', deassign: 'off',
      },
      // Watcher Unlink
      {
        path: 'watcher', type: 'unlink',
        listener: async function watcherUnlink($path) {
          const processPath = path.join(process.env.PWD, $path)
          const processes = this.getProcesses({ fileReference: processPath })
          if(processes.length) {
            const [$processIndex, $process] = processes[0]
            $process.active = false
            Array.prototype.splice.call(this, $processIndex, 1)
          }
          return this
        }.bind(this),
        assign: 'on', deassign: 'off',
      }
    ])
    Object.defineProperties(this, {
      watcher: {
        enumerable: true,
        get() {
          if(this.#watcher !== undefined) { return this.#watcher }
          const watcher = watch(this.#watchPaths, {
            ignoreInitial: false,
            awaitWriteFinish: true,
          })
          this.#watcher = watcher
          return this.#watcher
        }
      }
    })
    this.watcher
    this.enableEvents({ path: 'watcher' })
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
  getProcesses($filter) {
    const processes = []
    let processIndex = 0
    iterateProcesses: 
    for(const $process of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = ($filter[$filterKey] === $process.settings[$filterKey])
        }
      }
      if(match) { processes.push([processIndex, $process]) }
      processIndex++
    }
    return processes
  }
}