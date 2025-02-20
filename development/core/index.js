import { expandEvents, recursiveAssign } from '../coutil/index.js'
import CoreClassEvents from './propertyEvents/index.js'
import CoreEvent from './event/index.js'
import Settings from './settings/index.js' 
export default class Core extends EventTarget {
  #settings
  #events
  #parent
  #_propertyClassEvents
  #propertyClasses
  static propertyClasses = []
  constructor($settings = {}, $parent = {}) {
    super()
    this.settings = $settings
    this.parent = $parent
    this.addEvents(this.settings.events)
  }
  get #propertyClassEvents() {
    if(this.#_propertyClassEvents !== undefined) return this.#_propertyClassEvents
    this.#_propertyClassEvents = {}
    for(const [$propertyClassName, $propertyClass] of Object.entries(this.propertyClasses)) {
      this.#_propertyClassEvents[$propertyClassName] = $propertyClass.Events
    }
    return this.#_propertyClassEvents
  }
  get settings() { return this.#settings }
  set settings($settings) {
    if(this.#settings !== undefined) return
    this.#settings = Object.assign({}, Settings, $settings)
  }
  get parent() {
    if(this.#parent !== undefined) return this.#parent
    this.#parent = (
      this.settings.parent !== undefined
    ) ? this.settings.parent
      : undefined
    return this.#parent
  }
  set parent($parent) {
    if(this.#parent !== undefined) return
    this.#parent = $parent
  }
  get root() {
    let root = this
    iterateRoots: 
    while(root) {
      if([undefined, null].includes(root.parent)) break iterateRoots
      root = root.parent
    }
    return root
  }
  get events() {
    if(this.#events !== undefined) return this.#events
    this.#events = []
    return this.#events
  }
  get propertyClasses() {
    if(this.#propertyClasses !== undefined) return this.#propertyClasses
    this.#propertyClasses = this.settings.propertyClasses
    return this.#propertyClasses
  }
  getPropertyClass() {
    const { ID, Name } = arguments[0]
    let propertyClass
    iteratePropertyClasses: 
    for(const $propertyClass of this.propertyClasses) {
      if(
        ID && $propertyClass.ID === ID ||
        Name && $propertyClass.Name === Name
      ) { propertyClass = $propertyClass }
    }
    return propertyClass
  }
  getEvents() {
    const getEvents = []
    const { events } = this
    const $events = [].concat(arguments[0])
    iterateEvents: 
    for(const $event of $events) {
      const { type, path, listener, enable } = $event
      const eventFilterProperties = []
      if(type !== undefined) { eventFilterProperties.push(['type', type]) }
      if(path !== undefined) { eventFilterProperties.push(['path', path]) }
      if(listener !== undefined) { eventFilterProperties.push(['listener', listener]) }
      if(enable !== undefined) { eventFilterProperties.push(['enable', enable]) }
      getEvents.push(
        ...events.filter(($existingEvent) => {
          return eventFilterProperties.reduce(($match, [
            $eventFilterPropertyKey, $eventFilterPropertyValue
          ]) => {
            const match = (
              $existingEvent[$eventFilterPropertyKey] === $eventFilterPropertyValue
            ) ? true : false
            if($match !== false) { $match = match }
            return $match
          }, undefined)
        })
      )
    }
    return getEvents
  }
  addEvents() {
    if(arguments[0] === undefined) { return this }
    const $events = expandEvents(arguments[0])
    const { events } = this
    for(let $event of $events) {
      const propertyClassName = $event.path.split('.').shift()
      const propertyClassEvents = Object.assign(
        {}, 
        CoreClassEvents,
        this.#propertyClassEvents[propertyClassName]?.Events,
        $event?.sign, 
      )
      $event = Object.assign(
        {}, 
        $event,
        {
          context: this,
          propertyClassEvents,
        }
      )
      const coreEvent = new CoreEvent($event)
      events.push(coreEvent)
    }
    return this
  }
  removeEvents() {
    const { events } = this
    let $events
    if(arguments.length === 0) { $events = events }
    else if(arguments.length === 1) {
      $events = this.getEvents(arguments[0])
    }
    if($events.length === 0) return this
    let eventsIndex = events.length - 1
    iterateEvents: 
    while(eventsIndex > -1) {
      const event = events[eventsIndex]
      const removeEventIndex = $events.findIndex(
        ($event) => $event === event
      )
      if(removeEventIndex !== -1) {
        event.enable = false
        events.splice(eventsIndex, 1)
      }
      eventsIndex--
    }
    return this
  }
  enableEvents() {
    let $events
    if(arguments.length === 0) { $events = this.events }
    else { $events = this.getEvents(arguments[0]) }
    return this.#toggleEventAbility('addEventListener', $events)
  }
  disableEvents() {
    let $events
    if(arguments.length === 0) { $events = this.events }
    else { $events = this.getEvents(arguments[0]) }
    return this.#toggleEventAbility('removeEventListener', $events)
  }
  #toggleEventAbility($eventListenerMethod, $events) {
    let enability
    if($eventListenerMethod === 'addEventListener') { enability = true }
    else if($eventListenerMethod === 'removeEventListener') { enability = false }
    else { return this }
    iterateEvents:
    for(const $event of $events) {
      $event.enable = enability
    }
    return this
  }
}