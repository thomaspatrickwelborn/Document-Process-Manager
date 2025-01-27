import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
import Socket from './socket/index.js'
export default class Sockets extends EventTarget {
  length = 0
  #settings
  #dpm
  #source
  #target
  #active = false
  constructor($settings, $dpm) {
    super()
    this.#settings = $settings
    this.#dpm = $dpm
    this.#watcher
  }
  get active() { return this.#active }
  set active($active) {
    if(this.#active === $active) { return }
    if($active === true) {
      // 
    }
    else if($active === false) {
      // 
    }
    this.#active = $active
  }
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
  get #boundAdd() {
    if(this.#_boundAdd !== undefined) { return this.#_boundAdd}
    this.#_boundAdd = this.#add.bind(this)
    return this.#_boundAdd
  }
  get #boundChange() {
    if(this.#_boundChange !== undefined) { return this.#_boundChange}
    this.#_boundChange = this.#change.bind(this)
    return this.#_boundChange
  }
  get #boundUnlink() {
    if(this.#_boundUnlink !== undefined) { return this.#_boundUnlink}
    this.#_boundUnlink = this.#unlink.bind(this)
    return this.#_boundUnlink
  }
  async #add($path) {
    const routePath = path.join(process.env.PWD, $path)
    const routeImport = await import(routePath)
    .then(($routeImport) => $routeImport.default)
    Array.prototype.push.call(this, new Route(
      routeImport, this
    )
    return this
  }
  async #change($path) {
    const routePath = path.join(process.env.PWD, $path)
    const [$routeIndex, $route] = this.getRoutes({ routePath })[0]
    if($route) {
      const routeImport = await import(routePath)
      .then(($routeImport) => $routeImport.default)
      Array.prototype.splice.call(this, $routeIndex, 1, new Route(
        routeImport, this
      )
    }
    return this
  }
  async #unlink($path) {
    const routePath = path.join(process.env.PWD, $path)
    const [$routeIndex, $route] = this.getRoutes({ routePath })[0]
    if($route) {
      $route.active = false
      Array.prototype.splice.call(this, $routeIndex, 1)
    }
    return this
  }
}