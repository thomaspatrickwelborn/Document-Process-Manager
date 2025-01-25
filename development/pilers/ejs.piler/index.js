import { fileURLToPath } from 'url'
import path from 'node:path'
import Piler from '../../piler/index.js'
import createDir from '../../coutil/createDir/index.js'
import parseValidProperties from '../../coutil/parseValidProperties/index.js'
import beautify from 'js-beautify'
import ejs from 'ejs'
import { readFile } from 'node:fs/promises'
import { writeFile } from 'node:fs'
import OutputOptions from './OutputOptions.js'
export default class EJSPiler extends Piler {
  #model
  #renderFileOptions
  #compileOptions
  #_root
  constructor() {
    super(...arguments)
    this.watcher
  }
  get outputType() { return this.settings.outputType }
  get model() {
    if(this.#model !== undefined) { return this.#model }
    this.#model = path.join(this.route.source, this.settings.model)
    return this.#model
  }
  get renderFileOptions() {
    if(
      this.#renderFileOptions !== undefined ||
      this.settings.outputOptions === undefined
    ) { return this.#renderFileOptions }
    this.#renderFileOptions = parseValidProperties(this.settings.outputOptions, OutputOptions)
  this.#renderFileOptions.root = this.#renderFileOptions.root || []
    this.#renderFileOptions.root.unshift(
      path.join(this.#root, '../../../templates')
    )
    this.#renderFileOptions.async = true
    console.log(this)
    return this.#renderFileOptions
  }
  get compileOptions() {
    if(
      this.#compileOptions !== undefined ||
      this.settings.outputOptions === undefined
    ) { return this.#compileOptions }
    this.#compileOptions = parseValidProperties(this.settings.outputOptions, OutputOptions)
    this.#compileOptions.root = this.#compileOptions.root || []
    this.#compileOptions.root.unshift(
      path.join(this.#root, '../../../templates')
    )
    this.#compileOptions.async = true
    console.log(this)
    this.#compileOptions._with = false
    this.#compileOptions.compileDebug = false
    return this.#compileOptions
  }
  get #root() {
    if(this.#_root !== undefined) { return this.#_root }
    this.#_root = fileURLToPath(import.meta.url)
    return this.#_root
  }
  async pile($path) {
    const settings = this.settings
    const route = this.route
    await createDir(path.dirname($path))
    let viewPileBeautify
    // Server
    if(settings.outputType === 'server') {
      try {
        const model = JSON.parse(await readFile(this.model))
        const templatePath = this.input
        const viewPile = await ejs.renderFile(templatePath, model, this.renderFileOptions)
        viewPileBeautify = beautify.html(viewPile, {
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
    else if(settings.outputType === 'client') {
      try {
        const viewTemplatePath = $path
        const viewTemplate = await readFile(viewTemplatePath)
        .then(($viewTemplate) => $viewTemplate.toString())
        const viewPile = ejs.compile(viewTemplate, this.compileOptions)
        const viewPileString = [
          'export default', viewPile.toString()
        ].join(' ')
        viewPileBeautify = beautify.js(viewPileString, {
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
    return viewPileBeautify
  }

}