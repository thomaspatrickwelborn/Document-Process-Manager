# DPM Web Project Setup Guide
**DPM \| Guide \| Setup \| *Web Project Setup***  

## DPM Utilization
### Command Line Utilization
#### Global NPM Package
```
npm install -g document-process-manager
dpm --config dpm.config.js
```
#### Local NPM Package
```
npm install document-process-manager --save-dev
npx dpm --config dpm.config.js
```

### Module Utilization
```
import { read } from 'node:fs/promises'
import DPM from 'document-process-manager'
const dpmConfig = await import('./dpm.config.js')
.then(($config) => $config.default)
const dpm = new DPM(dpmConfig)
```

## Web Project Structure Setup
Web Projects may be configured by author style but must include a `package.json` file and `dpm.config.js` file.  
### Web Project Folder
```
 + Filesystem
   + /$projectFolderName
     - package.json
     - dpm.config.js
```

**Static**  
```
 + /$projectFolderName
   - package.json
   - dpm.config.js
   + develop
     - index.ejs
     - index.scss
     - index.js
   + distribute
     - index.html
     - index.css
     - index.js
```

### Web Project Package
### Web Project Documents
### Web Project Document Files
### Web Project Subdocuments
### DPM Configuration Object
```
import { readFile } from 'node:fs/promises'
import certificates from './certificates.js'
export default {
  name: "Project Name",
  source: 'documents',
  target: 'localhost',
  inspector: {
    port: 9200, // CUSTOM INSPECTOR PORT NUMBER
    host: "127.0.0.1",
  },
  server: {
    https: {
      key: await readFile(certificates.key.path),
      cert: await readFile(certificates.cert.path),
      port: 3300, // CUSTOM SERVER PORT NUMBER
      host: "localhost.name", // CUSTOM HOST
    },
  },
  browserSync: {
    port: 3301, // CUSTOM PROXY PORT NUMBER
    host: "localhost.name", // CUSTOM HOST
    https: {
      key: certificates.key.path,
      cert: certificates.cert.path,
    },
    files: ['static', 'localhost'],
    proxy: {
      ws: true,
    },
  },
  sockets: {
    config: '$socket.js',
  },
  router: {
    config: '$route.js',
    static: [
      // $path, $options
      ['static', {}],
      ['localhost', {}],
    ],
  },
  documents: {
    config: '$document.js',
  },
}
```
## Virtual Host Setup
### SSL Certificate Authority Setup
 - https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/#creating-ca-signed-certificates
### System Hosts File
 - /etc/hosts
### Apache Virtual Host Files
 - /etc/apache2/sites-available/

