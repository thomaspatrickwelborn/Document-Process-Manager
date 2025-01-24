import { fileURLToPath } from 'url'
import path from 'node:path'
import Piler from '../piler/index.js'
import createDir from '../coutil/createDir/index.js'
import beautify from 'js-beautify'
import ejs from 'ejs'
import { readFile } from 'node:fs/promises'
import { writeFile } from 'node:fs'
export default class EJSPiler extends Piler {
  #settings
  #section
  #model
  #_root
  constructor($settings, $section) {
    super(...arguments)
    this.#settings
    this.#section
    this.watcher
  }
  get outputType() { return this.#settings.outputType }
  get model() {
    if(this.#model !== undefined) { return this.#model }
    this.#model = path.join(this.section.source, this.settings.model)
    return this.#model
  }
  get #root() {
    if(this.#_root !== undefined) { return this.#_root }
    this.#_root = fileURLToPath(import.meta.url)
    return this.#_root
  }
  async pile($path) {
    const settings = this.settings
    const section = this.section
    // const $path = 
    await createDir(path.dirname($path))
    const localsName = settings.localsName || '$content'
    // Server
    if(settings.outputType === 'server') {
      try {
        const model = JSON.parse(await readFile(this.model))
        const templatePath = this.input
        const viewPile = await ejs.renderFile(templatePath, model, {
          async: true,
          localsName,
          root: [
            path.join(
              this.#root,
              '../../templates'
            )
          ]
        })
        const viewPileBeautify = beautify.html(viewPile, {
          maxPreserveNewlines: 0,
          indentSize: 2,
          indentChar: ' ',
        })
        const writeFilePath = this.output
        writeFile(writeFilePath, viewPileBeautify, ($err) => console.log)
      }
      catch($err) { console.log($err) }
    }
    // Client
    else  if(settings.outputType === 'client') {
      try {
        const viewTemplatePath = $path
        const viewTemplate = await readFile(viewTemplatePath)
        .then(($viewTemplate) => $viewTemplate.toString())
        const viewPile = ejs.compile(viewTemplate, {
          _with: false,
          localsName,
          client: true,
          compileDebug: false,
        })
        const viewPileString = [
          'export default', viewPile.toString()
        ].join(' ')
        const viewPileBeautify = beautify.js(viewPileString, {
          maxPreserveNewlines: 0,
          indentSize: 2,
          indentChar: ' ',
        })
        const viewPilePath = $path
        .replace(new RegExp(/\$/), '')
        .replace(new RegExp(/.ejs$/), '.js')
        writeFile(viewPilePath, viewPileBeautify, ($err) => console.log)
      }
      catch($err) { console.log($err) }
    }
    
  }

}