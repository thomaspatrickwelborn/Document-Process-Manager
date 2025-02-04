import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import express from 'express'
import { globSync } from 'glob'
import watch from 'glob-watcher'
import Route from './route/index.js'
export default class Router extends EventTarget {
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
          this.express.use(this.path, middleware)
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
  // get static() {
  //   if(this.#static !== undefined) { return this.#static }
  //   if(this.#settings.static !== undefined) {
  //     const staticElements = []
  //     for(const [$staticPath, $staticOptions] of this.#settings.static) {
  //       const staticPath = path.join(process.env.PWD, $staticPath)
  //       const staticElement = express.static(staticPath, $staticOptions)
  //       this.express.use(staticElement)
  //       staticElements.push([staticPath, staticElement])
  //     }
  //     this.#static = staticElements
  //   }
  //   return this.#static
  // }
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
    const routePath = path.join(process.env.PWD, $path)
    const routeImport = await import(routePath)
    .then(($routeImport) => $routeImport.default)
    Array.prototype.push.call(
      this, new Route(Object.assign(routeImport, {
        fileReference: routePath
      }), this)
    )
    return this
  }
  async #change($path) {
    const routePath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const routeImport = await import(routePath)
    .then(($routeImport) => $routeImport.default)
    const [$routeIndex, $route] = this.getRoutes({ path: routeImport.path })[0]
    if($route) {
      $route.active = false
      Array.prototype.splice.call(
        this, $routeIndex, 1, new Route(Object.assign(routeImport, {
          fileReference: routePath
        }), this)
      )
    }
    return this
  }
  async #unlink($path) {
    const routePath = path.join(process.env.PWD, $path)
    const [$routeIndex, $route] = this.getRoutes({ fileReference: routePath })[0]
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