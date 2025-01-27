import './coutil/persist/index.js'
import path from 'node:path'
import inspector from 'node:inspector'
import http from 'node:http'
import https from 'node:https'
import browserSync from 'browser-sync'
import { WebSocketServer } from 'ws'
import Router from './router/index.js'
import Sockets from './router/index.js'
import Documents from './documents/index.js'
export default class DocumentProcessManager extends EventTarget {
  #settings
  #inspector
  #server
  #browserSync
  #router
  #sockets
  #documents
  constructor($settings) {
    super()
    this.#settings = $settings
    this.inspector
    this.documents
    this.server
    this.sockets
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
  // Node Server
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
      this.#server = http.createServer(
        this.#settings.server.http,
        this.router.$
      )
      this.#server.listen(
        this.#settings.server.http.port, 
        this.#settings.server.http.host,
        ($request, $response) => { /**/ } 
      )
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
  // Sockets
  get sockets() {
    if(this.#sockets !== undefined) { return this.#sockets }
    if(this.#settings.sockets !== undefined) {
      this.#sockets = new Sockets(this.#settings.sockets, this)
    }
    return this.#sockets
  }
  // Documents
  get documents() {
    if(this.#documents !== undefined) { return this.#documents }
    if(this.#settings.documents !== undefined) {
      this.#documents = new Documents(this.#settings.documents, this)
    }
    return this.#documents
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