import path from 'node:path'
import { rm, mkdir, readFile } from 'node:fs'
import { globSync } from 'glob'
import watch from 'glob-watcher'
import DPMDocument from './document/index.js'
export default class Documents extends EventTarget {
  length = 0
  #settings
  #dpm
  #static
  #source
  #target
  #_watcher
  #boundAdd = this.#add.bind(this)
  #boundChange = this.#change.bind(this)
  #boundUnlink = this.#unlink.bind(this)
  constructor($settings, $dpm) {
    super()
    this.#settings = $settings
    this.#dpm = $dpm
    this.static
    this.#watcher
  }
  get #config() { return this.#settings.config }
  get source() {
    if(this.#settings.source !== undefined) return this.#settings.source
    this.#source = path.join(process.env.PWD, this.#settings.source)
    return this.#source
  }
  get target() {
    if(this.#settings.target !== undefined) return this.#settings.target
    this.#target = path.join(process.env.PWD, this.#settings.target)
    return this.#target
  }
  get #watcher() {
    if(this.#_watcher !== undefined) { return this.#_watcher }
    const watchPath = `${this.source}/**/${this.#config}`
    const watcher = watch(watchPath, {
      ignoreInitial: false,
      awaitWriteFinish: true,
    })
    watcher.on('add', this.#boundAdd)
    watcher.on('change', this.#boundChange)
    watcher.on('unlink', this.#boundUnlink)
    this.#_watcher = watcher
    return this.#_watcher
  }
  async #add($path) {
    const addPath = path.join(process.env.PWD, $path)
    const documentImport = await import(addPath)
    .then(($documentImport) => $documentImport.default)
    Array.prototype.push.call(this, new DPMDocument(Object.assign(
      documentImport, { fileReference: addPath }
    )))
    return this
  }
  async #change($path) {
    const changePath = path.join(process.env.PWD, $path).concat('?', Date.now())
    const documentImport = await import(changePath)
    .then(($documentImport) => $documentImport.default)
    const preterDocument = this.getDocuments({ path: documentImport.path })
    if(preterDocument.length) {
      const [$documentIndex, $document] = preterDocument[0]
      $document.active = false
      await $document.active
      const anterDocument = new DPMDocument(Object.assign(
        documentImport, { fileReference: changePath }
      ))
      Array.prototype.splice.call(this, $documentIndex, 1, anterDocument)
    }
    return this
  }
  async #unlink($path) {
    const unlinkPath = path.join(process.env.PWD, $path)
    const [$documentIndex, $document] = this.getDocuments({ fileReference: unlinkPath })[0]
    if($document) {
      $document.active = false
      await $document.active
      Array.prototype.splice.call(this, $documentIndex, 1)
    }
    return this
  }
  getDocuments($filter) {
    const documents = []
    let documentIndex = 0
    iterateDPMDocuments: 
    for(const $document of Array.from(this)) {
      let match
      iterateFilterKeys: 
      for(const $filterKey of Object.keys($filter)) {
        if(match !== false) {
          match = $filter[$filterKey] === $document[$filterKey]
        }
      }
      if(match) { documents.push([documentIndex, $document]) }
      documentIndex++
    }
    return documents
  }
}