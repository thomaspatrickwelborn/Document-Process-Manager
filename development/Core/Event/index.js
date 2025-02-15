export default class CoreEvent {
  #settings
  #enable = false
  #_boundListener
  constructor($settings) { 
    this.#settings = $settings
    this.enable = this.#settings.enable
  }
  get type() { return this.#settings.type }
  get path() { return this.#settings.path }
  get target() {
    let target = this.#context
    const pathKeys = this.path.split('.')
    let pathKeysIndex = 0
    iterateTargetPathKeys: 
    while(pathKeysIndex < pathKeys.length) {
      if(target === undefined) { break iterateTargetPathKeys }
      const pathKey = pathKeys[pathKeysIndex]
      if(pathKeysIndex === 0 && pathKey === ':scope') {
        break iterateTargetPathKeys
      }
      else {
        target = target[pathKey]
      }
      pathKeysIndex++
    }
    return target
  }
  get listener() { return this.#settings.listener }
  get options() { return this.#settings.options }
  get enable() { return this.#enable }
  set enable($enable) {
    if(
      $enable === this.#enable ||
      this.target === undefined
    ) { return }
    const eventAbility = (
      $enable === true
    ) ? this.#propertyClassEvents.Assign
      : this.#propertyClassEvents.Deassign
    if(eventAbility === undefined) { return }
    if(
      this.target instanceof NodeList ||
      Array.isArray(this.target)
    ) {
      for(const $target of this.target) {
        $target[eventAbility](this.type, this.#boundListener, this.options)
      }
      this.#enable = $enable
    }
    else if(this.target instanceof EventTarget) {
      this.target[eventAbility](this.type, this.#boundListener, this.options)
      this.#enable = $enable
    }
    else {
      try {
        this.target[eventAbility](this.type, this.#boundListener, this.options)
        this.#enable = $enable
      } catch($err) {}
    }
  }
  get #propertyClassEvents() { return this.#settings.propertyClassEvents }
  get #context() { return this.#settings.context }
  get #boundListener() {
    if(this.#_boundListener !== undefined) { return this.#_boundListener }
    this.#_boundListener = this.#settings.listener.bind(this.#context)
    return this.#_boundListener
  }
}