import Processors from '../processors/index.js'
import Socket from './socket/index.js'
export default class Sockets extends Processors {
  #server
  #boundServerUpgrade = this.#serverUpgrade.bind(this)
  constructor($settings, $dpm) {
    super(Object.assign({
      Subclass: Socket
    }, $settings), $dpm)
    this.server
  }
  get server() {
    if(this.#server !== undefined) return this.#server
    this.#server = this.dpm.server
    this.#server.on('upgrade', this.#boundServerUpgrade)
    return this.dpm.server
  }
  #serverUpgrade($request, $socket, $head) {
    iterateSockets: 
    for(const $webSocket of Array.from(this)) {
      if(
        $request.url === $webSocket.path &&
        $webSocket.active === true
      ) {
        $webSocket.webSocketServer.handleUpgrade($request, $socket, $head, function done($ws) {
          $webSocket.webSocketServer.emit('connection', $ws, $request)
        })
        break iterateSockets
      }
    }
  }
}