import Processes from '../processes/index.js'
import Socket from './socket/index.js'
export default class Sockets extends Processes {
  #server
  #boundServerUpgrade = this.#serverUpgrade.bind(this)
  constructor($settings, $options, $parent) {
    super(Object.assign({
      Subclass: Socket
    }, $settings), $options, $parent)
    this.server
  }
  get server() {
    if(this.#server !== undefined) return this.#server
    this.#server = this.parent.server
    this.#server.on('upgrade', this.#boundServerUpgrade)
    return this.parent.server
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