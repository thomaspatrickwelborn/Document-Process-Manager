import Processes from '../processes/index.js'
import DPMDocument from './document/index.js'
export default class Documents extends Processes {
  constructor($settings, $dpm) {
    super(Object.assign({
      Subclass: DPMDocument
    }, $settings), $dpm)
  }
}