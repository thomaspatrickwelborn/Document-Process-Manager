import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import express from 'express'
import { globSync } from 'glob'
import watch from 'glob-watcher'
import Router from './router/index.js'
export default class Routers extends EventTarget {
  length = 0
  #settings
  #dpm
  #express
  #expressRoute
  #middlewares
  #methods
  #errors
  #source
  #target
  #_watcher
  #boundAdd = this.#add.bind(this)
  #boundChange = this.#change.bind(this)
  #boundUnlink = this.#unlink.bind(this)
  constructor($settings, $dpm) {
    super()
    this.#settings = $settings
    this.#dpm = $dpm
    this.middlewares
    this.methods
    this.errors
    this.#watcher
  }
  get parent() { return this.#dpm }
  get express() {
    if(this.#express !== undefined) { return this.#express }
    this.#express = express(this.#settings.router || {})
    return this.#express
  }
  get expressRoute() {
    if(this.#expressRoute !== undefined) { return this.#expressRoute }
    this.#expressRoute = this.express.route(this.path)
    return this.#expressRoute
  }
  get #config() { return this.#settings.config }
  get source() {
    if(this.#settings.source !== undefined) return this.#settings.source
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
  }
  get middlewares() {
    if(this.#middlewares !== undefined) { return this.#middlewares }
    if(this.#settings.middlewares !== undefined) {
      const middlewares = []
      for(const $middleware of this.#settings.middlewares) {
        let middleware
        if($middleware.length === 1 && typeof $middleware === 'function') {
          middleware = $middleware[0]
        }
        else {
          const middlewareName = $middleware.splice(0, 1)[0]
          const middlewareArguments = $middleware.flat()
          if(['json', 'static', 'urlencoded'].includes(middlewareName)) {
            middleware = express[middlewareName](...middlewareArguments)
          }
          else {
            middleware = this.express[middlewareName](...middlewareArguments)
          }
        }
        if(middleware) {
          this.express.use(middleware)
          middlewares.push(middleware)
        }
      }
      this.#middlewares = middlewares
    }
    return this.#middlewares
  }
  get methods() {
    if(this.#methods !== undefined) { return this.#methods }
    if(this.#settings.methods !== undefined) {
      const methods = []
      for(const [$methodName, $method] of this.#settings.methods) {
        const method = this.expressRoute[$methodName]($method)
        methods.push(method)
      }
      this.#methods = methods
    }
    return this.#methods
  }
  get errors() {
    if(this.#errors !== undefined) { return this.#errors }
    if(this.#settings.errors !== undefined) {
      const errors = []
      for(const $error of this.#settings.errors) {
        let error
        if($error.length === 1 && typeof $error === 'function') {
          error = $error[0]
          this.express.use(this.path, error)
        }
        errors.push(error)
      }
      this.#errors = errors
    }
    return this.#errors
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
    const routerPath = path.join(process.env.PWD, $path)
    const routerImport = await import(routerPath)
    .then(($routerImport) => $routerImport.default)
    Array.prototype.push.call(
      this, new Router(Object.assign(routerImport, {
        fileReference: routerPath
      }), this)
    )
    return this
  }
  async #change($path) {
    const routerPath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const routerImport = await import(routerPath)
    .then(($routerImport) => $routerImport.default)
    const [$routerIndex, $router] = this.getRouters({ path: routerImport.path })[0]
    if($router) {
      $router.active = false
      Array.prototype.splice.call(
        this, $routerIndex, 1, new Router(Object.assign(routerImport, {
          fileReference: routerPath
        }), this)
      )
    }
    return this
  }
  async #unlink($path) {
    const routerPath = path.join(process.env.PWD, $path)
    const [$routerIndex, $router] = this.getRouters({ fileReference: routerPath })[0]
    if($router) {
      $router.active = false
      Array.prototype.splice.call(this, $routerIndex, 1)
    }
    return this
  }
  getRouters($filter) {
    const routers = []
    let routerIndex = 0
    iterateRouters: 
    for(const $router of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $router[$filterKey]
        }
      }
      if(match) { routers.push([routerIndex, $router]) }
      routerIndex++
    }
    return routers
  }
}