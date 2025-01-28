import path from 'node:path'
import express from 'express'
export default class Route extends EventTarget {
  #settings
  #router
  #expressRoute
  #source
  // #target
  #static
  #methods
  #active = false
  #depiled = false
  constructor($settings, $router) {
    super()
    this.#settings = $settings
    this.#router = $router
    this.active = this.#settings.active
  }
  get expressRoute() {
    if(this.#expressRoute !== undefined) { return this.#expressRoute }
    this.#expressRoute = this.#router.expressRouter.route(this.path)
    return this.#expressRoute
  }
  get active() { return this.#active }
  set active($active) {
    if(this.#active === $active) { return }
    if($active === true) {
      this.static
      this.methods
    }
    else if($active === false) {
      this.expressRoute.stack = []
      this.#static = undefined
      this.#methods = undefined
    }
    this.#active = $active
  }
  get name() { return this.#settings.name }
  get path() { return this.#settings.path }
  get source() {
    if(this.#source !== undefined) return this.#source
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
  }
  get static() {
    if(this.#static !== undefined) { return this.#static }
    if(this.#settings.static !== undefined) {
      const staticElements = []
      for(const [$staticPath, $staticOptions] of this.#settings.static) {
        const staticPath = path.join(process.env.PWD, $staticPath)
        const staticElement = express.static(staticPath, $staticOptions)
        this.#expressRoute.use(staticElement)
        staticElements.push([staticPath, staticElement])
      }
      this.#static = staticElements
    }
    return this.#static
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
  
}