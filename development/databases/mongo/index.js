import Processors from '../../processors/index.js'
import Database from './database/index.js'
export default class MongoDatabases extends Processors {
  constructor($settings, $dpm) {
    super(Object.assign({
      Subclass: Database
    }, $settings), $dpm)
  }
}