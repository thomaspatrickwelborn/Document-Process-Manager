import path from 'node:path'
import express from 'express'
import Core from '../../core/index.js'
export default class Router extends Core {
  #expressRouter
  #expressRoute
  #middlewares
  #methods
  #errors
  #active = false
  #parent
  constructor($settings, $options, $parent) {
    super(...arguments)
    this.#parent = $parent
    this.active = this.settings.active
  }
  get parent() { return this.#parent }
  get expressRouter() {
    if(this.#expressRouter !== undefined) { return this.#expressRouter }
    this.#expressRouter = express.Router()
    this.parent.express.use(this.path, this.#expressRouter)
    return this.#expressRouter
  }
  get expressRoute() {
    if(this.#expressRoute !== undefined) { return this.#expressRoute }
    this.#expressRoute = this.expressRouter.route('/')
    return this.#expressRoute
  }
  get active() { return this.#active }
  set active($active) {
    if($active === this.#active) { return }
    if($active === true) {
      this.middlewares
      this.methods
      this.errors
    }
    else if($active === false) {
      this.expressRoute.stack.length = 0
      let layerIndex = 0
      let spliceLayers = []
      const { stack } = this.parent.express._router
      for(const $layer of stack) {
        if($layer.name === 'router' && $layer.handle) {
          if($layer.handle === this.expressRouter) { spliceLayers.push(layerIndex) }
        }
        layerIndex++
      }
      for(const $spliceIndex of spliceLayers.reverse()) {
        stack.splice($spliceIndex, 1)
      }
      this.#middlewares = undefined
      this.#methods = undefined
    }
    this.#active = $active
  }
  get name() { return this.settings.name }
  get path() { return this.settings.path }
  get middlewares() {
    if(this.#middlewares !== undefined) { return this.#middlewares }
    if(this.settings.middlewares !== undefined) {
      const middlewares = []
      for(const $middleware of this.settings.middlewares) {
        let middleware
        if($middleware.length === 1 && typeof $middleware === 'function') {
          middleware = $middleware[0]
        }
        else {
          const middlewareName = $middleware[0]
          const middlewareArguments = $middleware[1]
          if(['json', 'static', 'urlencoded'].includes(middlewareName)) {
            middleware = express[middlewareName](...middlewareArguments)
          }
          else {
            middleware = this.expressRouter[middlewareName](...middlewareArguments)
          }
        }
        if(middleware !== undefined) {
          this.expressRouter.use('/', middleware)
          middlewares.push(middleware)
        }
      }
      this.#middlewares = middlewares
    }
    return this.#middlewares
  }
  get methods() {
    if(this.#methods !== undefined) { return this.#methods }
    if(this.settings.methods !== undefined) {
      const methods = []
      for(const [$methodName, $method] of this.settings.methods) {
        const method = this.expressRoute[$methodName]($method.bind(this))
        methods.push(method)
      }
      this.#methods = methods
    }
    return this.#methods
  }
  get errors() {
    if(this.#errors !== undefined) { return this.#errors }
    if(this.settings.errors !== undefined) {
      const errors = []
      for(const $error of this.settings.errors) {
        let error
        if($error.length === 1 && typeof $error === 'function') {
          error = $error[0]
          this.expressRouter.use('/', error)
        }
        errors.push(error)
      }
      this.#errors = errors
    }
    return this.#errors
  }
}