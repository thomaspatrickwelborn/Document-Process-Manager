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
  constructor($settings, $sockets) {
    super()
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
      server: this.#sockets.server,
    })
    this.#webSocketServer.on('connection', this.#websocketServerConnection.bind(this))
    this.#webSocketServer.on('close', this.#websocketServerClose.bind(this))
    this.#webSocketServer.on('error', this.#websocketServerError.bind(this))
    return this.#webSocketServer
  }
  get #webSocket() { return this.#_webSocket }
  set #webSocket($webSocket) {
    if($webSocket === undefined) { this.#_webSocket = undefined }
    else {
      this.#_webSocket = $webSocket
      this.#_webSocket.on('message', this.#websocketMessage.bind(this))
      this.#_webSocket.on('error', this.#websocketError.bind(this))
      this.#_webSocket.on('open', this.#websocketOpen.bind(this))
      this.#_webSocket.on('close', this.#websocketClose.bind(this))
    }
  }
  #websocketServerConnection($ws) { this.#webSocket = $ws }
  #websocketServerClose() { this.#webSocket = undefined }
  #websocketServerError($error) { console.error($error) }
  #websocketOpen() {}
  #websocketClose() {}
  #websocketError($error) { console.error($error) }
  #websocketMessage($data, $isBinary) {
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