import DPM from '../development/index.js'
import ApplicationConfig from './application.config.js'
const application = await new Promise(($resolve, $reject) => {
  const _application = new Application(ApplicationConfig)
  _application.on('ready', $resolve(_application))
})
