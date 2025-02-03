import { URL } from 'node:url'
import { Buffer } from 'node:buffer'
import { WebSocketServer } from 'ws'
import MessageAdapter from './messageAdapter/index.js'
export default class Socket extends EventTarget {
  #settings
  #sockets
  #webSocketServer
  #_webSocket
  #active = false
  #messageAdapters
  #url
  #_webSocketOpen
  #_webSocketClose
  #_webSocketError
  #boundWebSocketMessage
  #boundWebSocketServerConnection
  #boundWebSocketServerClose
  #boundWebSocketServerError
  constructor($settings, $sockets) {
    super()
    this.#boundWebSocketServerConnection = this.#webSocketServerConnection.bind(this)
    this.#boundWebSocketServerClose = this.#webSocketServerClose.bind(this)
    this.#boundWebSocketServerError = this.#webSocketServerError.bind(this)
    this.#boundWebSocketMessage = this.#webSocketMessage.bind(this)
    this.#settings = $settings
    this.#sockets = $sockets
    this.active = this.#settings.active
  }
  get active() { return this.#active }
  set active($active) {
    if($active === true) {
      this.webSocketServer
    }
    else if($active === false) {
      this.webSocketServer?.close()
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
      noServer: true,
    })
    this.#webSocketServer.on('connection', this.#boundWebSocketServerConnection)
    this.#webSocketServer.on('close', this.#boundWebSocketServerClose)
    this.#webSocketServer.on('error', this.#boundWebSocketServerError)
    return this.#webSocketServer
  }
  get #webSocket() { return this.#_webSocket }
  set #webSocket($webSocket) {
    if($webSocket === undefined) { this.#_webSocket = undefined }
    else {
      this.#_webSocket = $webSocket
      this.#_webSocket.on('message', this.#boundWebSocketMessage)
      this.#_webSocket.on('error', this.#webSocketError)
      this.#_webSocket.on('open', this.#webSocketOpen)
      this.#_webSocket.on('close', this.#webSocketClose)
    }
  }
  #webSocketServerConnection($ws) { this.#webSocket = $ws }
  #webSocketServerClose() { this.#webSocket = undefined }
  #webSocketServerError($error) { console.error($error) }
  get #webSocketOpen() {
    if(this.#_webSocketOpen !== undefined) { return this.#_webSocketOpen }
    this.#_webSocketOpen = this.#settings.open || function webSocketOpen($event) { }
    this.#_webSocketOpen = this.#_webSocketOpen.bind(this)
    return this.#_webSocketOpen
  }
  get #webSocketClose() {
    if(this.#_webSocketClose !== undefined) { return this.#_webSocketClose }
    this.#_webSocketClose = this.#settings.close || function webSocketClose($event) { }
    this.#_webSocketClose = this.#_webSocketClose.bind(this)
    return this.#_webSocketClose
  }
  get #webSocketError() {
    if(this.#_webSocketError !== undefined) { return this.#_webSocketError }
    this.#_webSocketError = this.#settings.error || function webSocketError($error) { console.error($error) }
    this.#_webSocketError = this.#_webSocketError.bind(this)
    return this.#_webSocketError
  }
  #webSocketMessage($data, $isBinary) {
    iterateAdapters: 
    for(const [
      $messageAdapterName, $messageAdapter
    ] of this.messageAdapters) {
      try {
        const message = $messageAdapter.message($data, $isBinary)
        const { type, detail } = message(this.#webSocket, $data, $isBinary)
        const messageEvent = new CustomEvent(type, { detail })
        this.dispatchEvent(messageEvent)
      }
      catch($err) { /* console.log($err) */ }
    }
  }
  get messageAdapters() {
    if(this.#messageAdapters !== undefined) { return this.#messageAdapters }
    const messageAdapters = []
    for(const [$adapterName, $adapter] of this.#settings.messageAdapters) {
      let adapter
      if($adapter instanceof MessageAdapter) { adapter = adapter }
      else { adapter = new MessageAdapter($adapter, this) }
      messageAdapters.push([$adapterName, adapter])
    }
    this.#messageAdapters = messageAdapters
    return this.#messageAdapters
  }
}