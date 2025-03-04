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
  #parent
  static propertyClasses = []
  constructor($settings, $options, $parent) {
    super(Object.assign({}, $settings, {
      propertyClasses: Socket.propertyClasses,
    }))
    this.#parent = $parent
    this.addEvents([
      // Web Socket Server Events
      {
        path: 'webSocketServer', type: 'connection',
        listener: function webSocketServerConnection($ws) {
          this.#webSocket = undefined
          this.webSocket = $ws
        }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      { 
        path: 'webSocketServer', type: 'close',
        listener: function webSocketServerClose() {
          this.#webSocketServer = undefined 
          this.#webSocket = undefined
        }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      { 
        path: 'webSocketServer', type: 'error',
        listener: function webSocketServerError($error) {
          console.error($error)
        }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      // Web Socket Events
      { 
        path: 'webSocket', type: 'message',
        listener: function webSocketMessage($data, $isBinary) {
          iterateAdapters: 
          for(const $messageAdapter of this.messageAdapters) {
            try {
              const message = $messageAdapter.message($data, $isBinary)
              const { type, detail } = message(this.webSocket, $data, $isBinary)
              const messageEvent = new SocketEvent(type, { detail, message: $data, isBinary: $isBinary })
              this.dispatchEvent(messageEvent)
            }
            catch($err) { /* console.error($err) */ }
          }
        }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      { 
        path: 'webSocket', type: 'error',
        listener: 
          this.settings?.error.bind(this) ||
          function webSocketError($error) {
            console.error($error)
          }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      { 
        path: 'webSocket', type: 'open',
        listener: 
          this.settings?.open.bind(this) || 
          function webSocketOpen($event) { }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
      { 
        path: 'webSocket', type: 'close',
        listener: 
          this.settings?.close.bind(this) ||
          function webSocketClose($event) { }.bind(this),
        target: { assign: 'on', deassign: 'off' },
      },
    ])
    Object.defineProperties(this, {
      webSocketServer: {
        enumerable: true,
        get() {
          if(this.#webSocketServer !== undefined) { return this.#webSocketServer }
          this.#webSocketServer = new WebSocketServer({
            path: this.path,
            noServer: true,
          })
          this.reenableEvents({ path: 'webSocketServer' })
          return this.#webSocketServer
        },
      }, 
      webSocket: {
        enumerable: true,
        get() { return this.#webSocket },
        set($webSocket) {
          if(this.#webSocket !== undefined) { return }
          this.#webSocket = $webSocket
          this.reenableEvents({ path: 'webSocket' })
        },
      },
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