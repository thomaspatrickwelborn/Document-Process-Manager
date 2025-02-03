import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
import { WebSocketServer } from 'ws'
import Socket from './socket/index.js'
export default class Sockets extends EventTarget {
  length = 0
  #settings
  #dpm
  #server
  #base
  #source
  #target
  #boundAdd
  #boundChange
  #boundUnlink
  #boundServerUpgrade
  #_watcher
  constructor($settings, $dpm) {
    super()
    this.#boundServerUpgrade = this.#serverUpgrade.bind(this)
    this.#boundAdd = this.#add.bind(this)
    this.#boundChange = this.#change.bind(this)
    this.#boundUnlink = this.#unlink.bind(this)
    this.#settings = $settings
    this.#dpm = $dpm
    this.server
    this.#watcher
  }
  get server() {
    if(this.#server !== undefined) return this.#server
    this.#server = this.#dpm.server
    this.#server.on('upgrade', this.#boundServerUpgrade)
    return this.#dpm.server
  }
  get base() {
    const { protocol, host, port } = this.#settings
    if(protocol && host && port) {
      this.#base = [protocol, '//', host, ':', port].join('')
    }
    return this.#base
  }
  get #config() { return this.#settings.config }
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
  #serverUpgrade($request, $socket, $head) {
    iterateSockets: 
    for(const $webSocket of Array.from(this)) {
      const { pathname } = new URL($request.url, $webSocket.url.origin)
      if(
        pathname === $webSocket.url.pathname &&
        $webSocket.active === true
      ) {
        $webSocket.webSocketServer.handleUpgrade($request, $socket, $head, function done($ws) {
          $webSocket.webSocketServer.emit('connection', $ws, $request)
        })
        break iterateSockets
      }
    }
  }
  async #add($path) {
    const socketPath = path.join(process.env.PWD, $path)
    const socketImport = await import(socketPath)
    .then(($socketImport) => $socketImport.default)
    Array.prototype.push.call(this, new Socket(
      Object.assign(socketImport, {
        fileReference: socketPath
      }), this
    ))
    return this
  }
  async #change($path) {
    const socketPath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const socketImport = await import(socketPath)
    .then(($socketImport) => $socketImport.default)
    const [$socketIndex, $socket] = this.getSockets({ path: socketImport.path })[0]
    $socket.active = false
    delete this[$socketIndex]
    const splicedSockets = Array.prototype.splice.call(this, $socketIndex, 1, new Socket(
      Object.assign(socketImport, {
        fileReference: socketPath
      }), this
    ))
    return this
  }
  async #unlink($path) {
    const socketPath = path.join(process.env.PWD, $path)
    const [$socketIndex, $socket] = this.getSockets({ fileReference: socketPath })[0]
    if($socket) {
      $socket.active = false
      Array.prototype.splice.call(this, $socketIndex, 1)
    }
    return this
  }
  getSockets($filter) {
    const sockets = []
    let socketIndex = 0
    iterateSockets: 
    for(const $socket of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $socket[$filterKey]
        }
      }
      if(match) { sockets.push([socketIndex, $socket]) }
      socketIndex++
    }
    return sockets
  }
}