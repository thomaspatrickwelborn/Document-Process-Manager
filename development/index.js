import './coutil/persist/index.js'
import path from 'node:path'
import inspector from 'node:inspector'
import https from 'node:https'
import express from 'express'
import browserSync from 'browser-sync'
import Router from './router/index.js'
export default class DocumentProcessManager extends EventTarget {
  #settings
  #_inspector
  #_server
  #_https
  #_browserSync
  #_router
  constructor($settings) {
    super()
    this.#settings = $settings
    this.inspector
    this.server
    this.https
    this.router
    this.browserSync
  }
  get name() { return this.#settings.name }
  // Node Inspector
  get inspector() {
    if(this.#_inspector !== undefined) {
      return this.#_inspector
    }
    this.#_inspector = inspector.open(
      this.#settings.inspector.port,
      this.#settings.inspector.host
    )
    return this.#_inspector
  }
  // Node HTTPS Server
  get https() {
    if(this.#_https !== undefined) {
      return this.#_https
    }
    this.#_https = https.createServer(
      {
        key: this.#settings.https.key,
        cert: this.#settings.https.cert,
      },
      this.server
    )
    this.#_https.listen(
      this.#settings.https.port, 
      this.#settings.https.host,
      ($request, $response) => {
        // 
      } 
    )
    return this.#_https
  }
  // BrowserSync
  get browserSync() {
    if(this.#_browserSync !== undefined) {
      return this.#_browserSync
    }
    const browserSyncServerOptions = {
      ui: false, 
      open: false, 
      https: this.#settings.browserSync.https,
      host: this.#settings.browserSync.host,
      port: this.#settings.browserSync.port,
      files: this.#settings.browserSync.files,
      proxy: {
        target: [
          "https://",
          this.#settings.https.host, ":",
          this.#settings.https.port,
        ].join(''),
        ws: false,
      },
    }
    this.#_browserSync = browserSync.create()
    this.#_browserSync.init(browserSyncServerOptions)
    this.dispatchEvent(new CustomEvent('ready', { detail: this }))
    return this.#_browserSync
  }
  // Router
  get router() {
    if(this.#_router !== undefined) { return this.#_router }
    this.#_router = new Router(this.#settings.router)
    return this.#_router
  }
}