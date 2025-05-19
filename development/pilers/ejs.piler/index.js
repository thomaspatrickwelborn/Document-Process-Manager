import { fileURLToPath } from 'url'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import beautify from 'js-beautify'
import ejs from 'ejs'
import Piler from '../../piler/ad/index.js'
import createDir from '../../coutil/createDir/index.js'
import parseValidProperties from '../../coutil/parseValidProperties/index.js'
import OutputOptions from './OutputOptions.js'
export default class EJSPiler extends Piler {
  #model
  #renderFileOptions
  #compileOptions
  #_root
  constructor($settings, $options, $document) {
    super(...arguments)
  }
  get outputType() { return this.settings.outputType }
  get model() {
    if(this.#model !== undefined) { return this.#model }
    this.#model = path.join(this.document.source, this.settings.model)
    return this.#model
  }
  get renderFileOptions() {
    if(
      this.#renderFileOptions !== undefined ||
      this.settings.outputOptions === undefined
    ) { return this.#renderFileOptions }
    this.#renderFileOptions = parseValidProperties(this.settings.outputOptions, OutputOptions)
    this.#renderFileOptions.root.unshift(
      path.join(process.env.PWD, 'templates')
    )
    this.#renderFileOptions.async = true
    return this.#renderFileOptions
  }
  get compileOptions() {
    if(
      this.#compileOptions !== undefined ||
      this.settings.outputOptions === undefined
    ) { return this.#compileOptions }
    this.#compileOptions = parseValidProperties(this.settings.outputOptions, OutputOptions)
    this.#compileOptions = parseValidProperties(this.settings.outputOptions, OutputOptions)
    this.#compileOptions.root.unshift(
      path.join(process.env.PWD, 'templates')
    )
    this.#compileOptions.async = true
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
    await createDir(path.dirname($path))
    let viewPileBeautify
    // Server
    if(
      settings.outputType === 'server' ||
      settings.outputType === undefined
    ) {
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
        await writeFile(writeFilePath, viewPileBeautify)
      }
      catch($err) {
        if(this.document.parent.logErrors) console.error($err) 
      }
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
        await writeFile(viewPilePath, viewPileBeautify)
      }
      catch($err) {
        if(this.document.parent.logErrors) console.error($err) 
      }
    }
    return viewPileBeautify
  }

}