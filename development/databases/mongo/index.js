import Processes from '../../processes/index.js'
import Database from './database/index.js'
export default class MongoDatabases extends Processes {
  constructor($settings, $options, $parent) {
    super(Object.assign({
      Subclass: Database
    }, $settings), $options, $parent)
  }
}