import Core from './core/index.js'
import { recursiveAssign } from './coutil/index.js'
import './coutil/persist/index.js'
import path from 'node:path'
import inspector from 'node:inspector'
import http from 'node:http'
import https from 'node:https'
import express from 'express'
import browserSync from 'browser-sync'
import { WebSocketServer } from 'ws'
import Routers from './routers/index.js'
import Sockets from './sockets/index.js'
import Documents from './documents/index.js'
import Databases from './databases/mongo/index.js'
export default class DocumentProcessManager extends Core {
  #inspector
  #server
  #express
  #browserSync
  #routers
  #sockets
  #documents
  #databases
  constructor($settings, $options) {
    super(...arguments)
    this.inspector
    this.databases
    this.documents
    this.server
    this.sockets
    this.browserSync
  }
  get name() { return this.settings.name }
  // Node Inspector
  get inspector() {
    if(this.#inspector !== undefined) { return this.#inspector }
    this.#inspector = inspector.open(
      this.settings.inspector.port,
      this.settings.inspector.host
    )
    return this.#inspector
  }
  // Node Server
  get server() {
    if(this.#server !== undefined) { return this.#server }
    if(this.settings.server === undefined) { this.#server === undefined }
    if(this.settings.server.https) {
      // Node HTTPS Server
      this.#server = https.createServer(
        this.settings.server.https,
        this.routers.express
      )
      this.#server.listen(
        this.settings.server.https.port, 
        this.settings.server.https.host,
        ($request, $response) => {}
      )
    }
    else if(this.settings.server.http) {
      // Node HTTPS Server
      this.#server = http.createServer(
        this.settings.server.http,
        this.routers.express
      )
      this.#server.listen(
        this.settings.server.http.port, 
        this.settings.server.http.host,
        ($request, $response) => {}
      )
    }
    return this.#server
  }
  // BrowserSync
  get browserSync() {
    if(this.#browserSync !== undefined) { return this.#browserSync }
    if(this.settings.browserSync === undefined) return
    const serverOptions = this.settings.server.https || this.settings.server.http
    let serverProtocol
    if(this.settings.server.https) { serverProtocol = "https://" }
    else if(this.settings.server.http) { serverProtocol = "http://" }
    const browserSyncServerOptions = recursiveAssign(this.settings.browserSync, {
      proxy: {
        target: serverProtocol.concat(
          serverOptions.host, ":",
          serverOptions.port,
        ),
      },
    })
    this.#browserSync = browserSync.create()
    this.#browserSync.init(browserSyncServerOptions)
    this.dispatchEvent(new CustomEvent('ready', { detail: this }))
    return this.#browserSync
  }
  // Routers
  get routers() {
    if(this.#routers !== undefined) { return this.#routers }
    if(this.settings.server === undefined) return
    this.#routers = new Routers(this.settings.routers || {}, {}, this)
    return this.#routers
  }
  // Sockets
  get sockets() {
    if(this.#sockets !== undefined) { return this.#sockets }
    if(this.settings.server === undefined) return
    if(this.settings.sockets !== undefined) {
      this.#sockets = new Sockets(this.settings.sockets, {}, this)
    }
    return this.#sockets
  }
  // Documents
  get documents() {
    if(this.#documents !== undefined) { return this.#documents }
    if(this.settings.documents !== undefined) {
      this.#documents = new Documents(this.settings.documents, {}, this)
    }
    return this.#documents
  }
  // Databases
  get databases() {
    if(this.#databases !== undefined) { return this.#databases }
    if(this.settings.databases !== undefined) {
      this.#databases = new Databases(this.settings.databases, {}, this)
    }
    return this.#databases
  }
}