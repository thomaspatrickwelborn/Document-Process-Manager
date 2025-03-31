import Processes from '../processes/index.js'
import Socket from './socket/index.js'
export default class Sockets extends Processes {
  #server
  constructor($settings, $options, $parent) {
    super(Object.assign({
      Subclass: Socket
    }, $settings), $options, $parent)
    Object.defineProperties(this, {
      server: {
        enumerable: true,
        get() {
          if(this.#server !== undefined) return this.#server
          this.#server = this.parent.server
          return this.parent.server
        }
      },
    })
    this.addEvents([
      // Server Events
      {
        path: 'server', type: 'upgrade',
        listener: function serverUpgrade($request, $socket, $head) {
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
        },
        assign: 'on', deassign: 'off',
      }
    ])
    this.enableEvents()
    this.server
  }
}