import './coutil/persist/index.js'
import path from 'node:path'
import inspector from 'node:inspector'
import http from 'node:http'
import https from 'node:https'
import browserSync from 'browser-sync'
import Router from './router/index.js'
export default class DocumentProcessManager extends EventTarget {
  #settings
  #inspector
  #server
  #browserSync
  #router
  constructor($settings) {
    super()
    this.#settings = $settings
    this.inspector
    this.server
    this.browserSync
  }
  get name() { return this.#settings.name }
  // Node Inspector
  get inspector() {
    if(this.#inspector !== undefined) { return this.#inspector }
    this.#inspector = inspector.open(
      this.#settings.inspector.port,
      this.#settings.inspector.host
    )
    return this.#inspector
  }
  get server() {
    if(this.#server !== undefined) { return this.#server }
    if(this.#settings.server.https) {
      // Node HTTPS Server
      this.#server = https.createServer(
        this.#settings.server.https,
        this.router.express
      )
      this.#server.listen(
        this.#settings.server.https.port, 
        this.#settings.server.https.host,
        ($request, $response) => { /**/ } 
      )
    }
    else if(this.server.http) {
      // Node HTTPS Server
    }
    return this.#server
  }
  // Router
  get router() {
    if(this.#router !== undefined) { return this.#router }
    if(this.#settings.router !== undefined) {
      this.#router = new Router(this.#settings.router, this)
    }
    return this.#router
  }
  // BrowserSync
  get browserSync() {
    if(this.#browserSync !== undefined) { return this.#browserSync }
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
          this.#settings.server.https.host, ":",
          this.#settings.server.https.port,
        ].join(''),
        ws: false,
      },
    }
    this.#browserSync = browserSync.create()
    this.#browserSync.init(browserSyncServerOptions)
    this.dispatchEvent(new CustomEvent('ready', { detail: this }))
    return this.#browserSync
  }
}