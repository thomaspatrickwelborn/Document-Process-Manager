import { URL } from 'node:url'
import { Buffer } from 'node:buffer'
import WebSocket, { WebSocketServer } from 'ws'
import MessageAdapter from './messageAdapter/index.js'
export default class Socket extends EventTarget {
  #settings
  #sockets
  #webSocketServer
  #webSocket
  #active = false
  #messageAdapters
  #url
  #_boundConnection
  #boundOpen
  #boundClose
  #boundError
  #boundMessage
  constructor($settings, $sockets) {
    super()
    this.#settings = $settings
    this.#sockets = $sockets
    this.active = this.#settings.active
    this.#boundOpen = this.#open.bind(this)
    this.#boundClose = this.#close.bind(this)
    this.#boundError = this.#error.bind(this)
    this.#boundMessage = this.#message.bind(this)
  }
  get active() { return this.#active }
  set active($active) {
    if(this.#active === $active) { return }
    if($active === true) {
      this.webSocketServer
    }
    else if($active === false) {
      this.webSocketServer.close()
      this.#webSocketServer = undefined 
      this.#webSocket = undefined
    }
    this.#active = $active
  }
  get fileReference() { return this.#settings.fileReference }
  get path() { return this.#settings.path }
  get url() {
    if(this.#url !== undefined) { return this.#url }
    let { protocol, host, port } = this.#settings
    let base
    if(protocol && host && port) {
      base = [protocol, '//', host, ':', port].join('')
    }
    else {
      base = this.sockets.base
    }
    this.#url = new URL(this.path, base)
    return this.#url
  }
  get webSocketServer() {
    if(this.#webSocketServer !== undefined) { return this.#webSocketServer }
    this.#webSocketServer = new WebSocketServer({
      path: this.url.pathname,
      server: this.#sockets.server,
    })
    this.#webSocketServer.on('connection', this.#boundConnection)
    return this.#webSocketServer
  }
  get webSocket() { return this.#webSocket }
  set webSocket($webSocket) {
    if(this.#webSocket !== undefined) return
    this.#webSocket = $webSocket
    this.#webSocket.on('open', this.#boundOpen)
    this.#webSocket.on('close', this.#boundClose)
    this.#webSocket.on('error', this.#boundError)
    this.#webSocket.on('message', this.#boundMessage)
  }
  get #boundConnection() {
    if(this.#_boundConnection !== undefined) { return this.#_boundConnection }
    this.#_boundConnection = this.#connection.bind(this)
    return this.#_boundConnection
  }
  #connection($ws) {
    this.webSocket = $ws
  }
  #open($event) { console.log("#open", $event) }
  #close($event) { console.log("#close", $event) }
  #error() { console.error("#error", ...arguments) }
  #message($data, $isBinary) {
    iterateAdapters: 
    for(const [
      $messageAdapterName, $messageAdapter
    ] of this.messageAdapters) {
      try {
        const message = $messageAdapter.message($data, $isBinary)
        return message(this.webSocket, $data, $isBinary)
      }
      catch($err) { /* console.log($err) */ }
    }
  }
  get messageAdapters() {
    if(this.#messageAdapters !== undefined) { return this.#messageAdapters }
    const messageAdapters = []
    for(const [$adapterName, $adapter] of this.#settings.messageAdapters) {
      const adapter = new MessageAdapter($adapter, this)
      messageAdapters.push([$adapterName, adapter])
    }
    this.#messageAdapters = messageAdapters
    return this.#messageAdapters
  }
}