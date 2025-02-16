import Processors from '../processors/index.js'
import DPMDocument from './document/index.js'
export default class Documents extends Processors {
  constructor($settings, $dpm) {
    super(Object.assign({
      Subclass: DPMDocument
    }, $settings), $dpm)
  }
}