import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
import Route from './route/index.js'
import RouteMethodNames from '../coutil/routeMethods/index.js'
export default class Router extends EventTarget {
  length = 0
  #settings
  #_watcher
  #source
  #target
  #_boundAdd
  #_boundChange
  #_boundUnlink
  constructor($settings) {
    super()
    this.#settings = $settings
    this.#watcher
  }
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
  get #routeKey() { return this.#settings.routeKey }
  get #watcher() {
    if(this.#_watcher !== undefined) { return this.#_watcher }
    const watchPath = `${this.source}/**/${this.#routeKey}`
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
    Array.prototype.push.call(this, new Route(Object.assign(routeImport, { routePath })))
    return this
  }
  async #change($path) {
    const routePath = path.join(process.env.PWD, $path)
    const [$routeIndex, $route] = this.getRoutes({ routePath })[0]
    if($route) {
      const routeImport = await import(routePath)
      .then(($routeImport) => $routeImport.default)
      Array.prototype.splice.call(this, $routeIndex, 1, new Route(Object.assign(routeImport, { routePath })))
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
  getRoutes($filter) {
    const routes = []
    let routeIndex = 0
    iterateRoutes: 
    for(const $route of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $route[$filterKey]
        }
      }
      if(match) { routes.push([routeIndex, $route]) }
      routeIndex++
    }
    return routes
  }
}