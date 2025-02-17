import Processes from '../processes/index.js'
import express from 'express'
import Router from './router/index.js'
export default class Routers extends Processes {
  #express
  #expressRoute
  #middlewares
  #methods
  #errors
  constructor($settings, $dpm) {
    super(Object.assign({
      Subclass: Router
    }, $settings), $dpm)
    this.middlewares
    this.methods
    this.errors
  }
  get express() {
    if(this.#express !== undefined) { return this.#express }
    this.#express = express(this.settings.router || {})
    return this.#express
  }
  get expressRoute() {
    if(this.#expressRoute !== undefined) { return this.#expressRoute }
    this.#expressRoute = this.express.route(this.path)
    return this.#expressRoute
  }
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
    if(this.settings.methods !== undefined) {
      const methods = []
      for(const [$methodName, $method] of this.settings.methods) {
        const method = this.expressRoute[$methodName]($method)
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
          this.express.use(this.path, error)
        }
        errors.push(error)
      }
      this.#errors = errors
    }
    return this.#errors
  }
}