import { readFile } from 'node:fs/promises'
import certificates from './certificates.js'
certificates.key.file = await readFile(
  certificates.key.path
)
certificates.cert.file = await readFile(
  certificates.cert.path
)
export default {
  name: "Document Process Manager", 
  inspector: {
    port: 9239,
    host: "127.0.0.1",
  },
  https: {
    key: certificates.key.file,
    cert: certificates.cert.file,
    port: 3340,
    host: "dpm.demonstrament-a",
  },
  browserSync: {
    port: 3341,
    host: "dpm.demonstrament-a",
    https: {
      key: certificates.key.path,
      cert: certificates.cert.path,
    },
    files: [
      'localhost',
      'static'
    ]
  },
  router: {
    routeKey: '$route.js'
    source: 'sections',
    target: 'localhost',
    static: [
      // $path, $options
      ['static', {}], 
      ['localhost', {}],
    ],
  },
}
