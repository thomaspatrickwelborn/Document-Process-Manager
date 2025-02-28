import { URL } from 'node:url'
import { Buffer } from 'node:buffer'
import { WebSocketServer } from 'ws'
import MessageAdapter from './messageAdapter/index.js'
import SocketEvent from './event/index.js'
import { Core } from 'core-plex'
export default class Socket extends Core {
  #webSocketServer
  #webSocket
  #active = false
  #messageAdapters
  #_webSocketOpen
  #_webSocketClose
  #_webSocketError
  #boundWebSocketServerConnection = this.#webSocketServerConnection.bind(this)
  #boundWebSocketServerClose = this.#webSocketServerClose.bind(this)
  #boundWebSocketServerError = this.#webSocketServerError.bind(this)
  #boundWebSocketMessage = this.#webSocketMessage.bind(this)
  #parent
  static propertyClasses = [{
    Name: "webSocketServer",
    Events: { Assign: "on", Deassign: "off" },
    Names: {
      Monople: { Formal: "WebSocketServer", Nonformal: "webSocketServer" },
    },
  },
  {
    Name: "webSocket",
    Events: { Assign: "on", Deassign: "off" },
    Names: {
      Monople: { Formal: "WebSocket", Nonformal: "webSocket" },
    },
  }]
  constructor($settings, $options, $parent) {
    super(Object.assign({}, $settings, {
      propertyClasses: Socket.propertyClasses,
    }))
    this.#parent = $parent
    this.addEvents({
      'webSocketServer connection': this.#boundWebSocketServerConnection,
      'webSocketServer close': this.#boundWebSocketServerClose,
      'webSocketServer error': this.#boundWebSocketServerError,
      'webSocket message': this.#boundWebSocketMessage,
      'webSocket error': this.#webSocketError,
      'webSocket open': this.#webSocketOpen,
      'webSocket close': this.#webSocketClose,
    })
    this.active = this.settings.active
  }
  get parent() { return this.#parent }
  get active() { return this.#active }
  set active($active) {
    if($active === true) {
      this.webSocketServer
    }
    else if($active === false) {
      this.webSocketServer?.close()
    }
    this.#active = $active
  }
  get fileReference() { return this.settings.fileReference }
  get path() { return this.settings.path }
  get webSocketServer() {
    if(this.#webSocketServer !== undefined) { return this.#webSocketServer }
    this.#webSocketServer = new WebSocketServer({
      path: this.path,
      noServer: true,
    })
    this.enableEvents({ path: 'webSocketServer' })
    return this.#webSocketServer
  }
  get webSocket() { return this.#webSocket }
  set webSocket($webSocket) {
    if(this.#webSocket !== undefined) { return }
    this.#webSocket = $webSocket
    this.enableEvents({ path: 'webSocket' })
  }
  #webSocketServerConnection($ws) { this.#webSocket = $ws }
  #webSocketServerClose() {
    this.disableEvents({})
    this.#webSocketServer = undefined 
    this.#webSocket = undefined
  }
  #webSocketServerError($error) { console.error($error) }
  get #webSocketOpen() {
    if(this.#_webSocketOpen !== undefined) { return this.#_webSocketOpen }
    this.#_webSocketOpen = this.settings.open || function webSocketOpen($event) { }
    this.#_webSocketOpen = this.#_webSocketOpen.bind(this)
    return this.#_webSocketOpen
  }
  get #webSocketClose() {
    if(this.#_webSocketClose !== undefined) { return this.#_webSocketClose }
    this.#_webSocketClose = this.settings.close || function webSocketClose($event) { }
    this.#_webSocketClose = this.#_webSocketClose.bind(this)
    return this.#_webSocketClose
  }
  get #webSocketError() {
    if(this.#_webSocketError !== undefined) { return this.#_webSocketError }
    this.#_webSocketError = this.settings.error || function webSocketError($error) { console.error($error) }
    this.#_webSocketError = this.#_webSocketError.bind(this)
    return this.#_webSocketError
  }
  #webSocketMessage($data, $isBinary) {
    iterateAdapters: 
    for(const $messageAdapter of this.messageAdapters) {
      try {
        const message = $messageAdapter.message($data, $isBinary)
        const { type, detail } = message(this.webSocket, $data, $isBinary)
        const messageEvent = new SocketEvent(type, { detail, message: $data, isBinary: $isBinary })
        this.dispatchEvent(messageEvent)
      }
      catch($err) { /* console.log($err) */ }
    }
  }
  get messageAdapters() {
    if(this.#messageAdapters !== undefined) { return this.#messageAdapters }
    const messageAdapters = []
    for(const $adapter of this.settings.messageAdapters) {
      let adapter
      if($adapter instanceof MessageAdapter) { adapter = adapter }
      else { adapter = new MessageAdapter($adapter, this) }
      messageAdapters.push(adapter)
    }
    this.#messageAdapters = messageAdapters
    return this.#messageAdapters
  }
  send() { this.webSocket.send(...arguments) }
}