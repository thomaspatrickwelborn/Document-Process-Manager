import WebSocket from 'ws'
export default class Socket extends EventTarget {
  #settings
  #sockets
  #$
  #active = false
  #messages
  #_boundConnection
  #_boundOpen
  #_boundClose
  #_boundError
  #_boundMessage
  constructor($settings, $sockets) {
    super()
    this.#settings = $settings
    this.#sockets = $sokcets
    this.active = this.#settings.active
  }
  get active() { return this.#active }
  set active($active) {
    if(this.#active === $active) { return }
    if($active === true) {
      this.$
    }
    else if($active === false) {
      this.$.terminate()
    }
    this.#active = $active
  }
  get $() {
    if(this.#$ !== undefined) { return this.#$ }
    this.#$ = new WebSocket(this.path)
    this.#$.on('connection', this.#boundConnection)
    return this.#$
  }
  get path() { return this.#settings.path }
  get #boundConnection() {
    if(this.#_boundConnection !== undefined) { return this.#_boundConnection }
    this.#_boundConnection = this.#connection.bind(this)
    return this.#_boundConnection
  }
  get #boundOpen() {
    if(this.#_boundOpen !== undefined) { return this.#_boundOpen }
    this.#_boundOpen = this.#open.bind(this)
    return this.#_boundOpen
  }
  get #boundClose() {
    if(this.#_boundClose !== undefined) { return this.#_boundClose }
    this.#_boundClose = this.#close.bind(this)
    return this.#_boundClose
  }
  get #boundError() {
    if(this.#_boundError !== undefined) { return this.#_boundError }
    this.#_boundError = this.#error.bind(this)
    return this.#_boundError
  } 
  get #boundMessage() {
    if(this.#_boundMessage !== undefined) { return this.#_boundMessage }
    this.#_boundMessage = this.#message.bind(this)
    return this.#_boundMessage
  }
  #connection($ws) {
    $ws.on('open', this.#boundOpen)
    $ws.on('close', this.#boundClose)
    $ws.on('error', this.#boundError)
    $ws.on('message', this.#boundMessage)
    this.#$.off('open')
  }
  #open($event) {}
  #close($event) {}
  #error() { console.error(...arguments) }
  #message($event, $isBinary) {
    const { data } = $event
    const { type } = data
    const messages = Object.fromEntries(this.messages)
    const message = messages[type]
    message(data)
  }
  get messages() {
    if(this.#messages !== undefined) { return this.#messages }
    if(this.#settings.messages !== undefined) {
      const messages = []
      for(const [$messageName, $messageMethod] of this.#settings.messages) {
        messages.push([$messageName, $messageMethod.bind(this)])
      }
      this.#messages = messages
    }
    return this.#messages
  }
}