import { expandEvents, recursiveAssign } from '../coutil/index.js'
import CoreClassEvents from './PropertyEvents/index.js'
import { CoreClassInstantiator, CoreClassDeinstantiator } from './PropertyInstantiators/index.js'
import CoreEvent from './Event/index.js'
import PropertyClass from './PropertyClass/index.js'
import Settings from './Settings/index.js' 
import Options from './Options/index.js' 
export default class Core extends EventTarget {
  #settings
  #options
  #events
  #key
  #path
  #parent
  #_propertyClassEvents
  #propertyClasses
  static propertyClasses = []
  constructor($settings = {}, $options = {}) {
    super()
    this.settings = $settings
    this.options = $options
    this.addPropertyClasses(this.settings.propertyClasses)
    for(const $propertyClass of this.propertyClasses) {
      const { Name, Names } = $propertyClass
      this[`${Names.Minister.Ad.Nonformal}${Names.Multiple.Formal}`](this.settings[Name])
      if(this.settings[Name] !== undefined) {
        this[Name] = this.settings[Name]
      }
    }
    this.addEvents(this.settings.events)
    this.#defineProperties(this.options.defineProperties)
    this.#assign(...this.options.assign)
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
  get options() { return this.#options }
  set options($options) {
    if(this.#options !== undefined) return
    this.#options = recursiveAssign(structuredClone(Options), $options)
  }
  get key() {
    if(this.#key !== undefined) return this.#key
    this.#key = this.path?.split('.').pop() || null
    return this.#key
  }
  get path() {
    if(this.#path !== undefined) return this.#path
    this.#path = (this.settings.path !== undefined)
      ? this.settings.path
      : undefined
    return this.#path
  }
  set path($path) {
    if(this.#path !== undefined) return
    this.#path = $path
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
    this.#propertyClasses = []
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
  addPropertyClasses() {
    if(!arguments[0]) { return this }
    const $this = this
    let $propertyClasses
    if(Array.isArray(arguments[0])) { $propertyClasses = arguments[0] }
    else if(typeof arguments[0] === 'object') { $propertyClasses = Object.values(arguments[0]) }
    const propertyClasses = this.propertyClasses
    for(const $propertyClass of $propertyClasses) {
      const propertyClassName = $propertyClass.Name
      // Property Class Events
      if($propertyClass.Events === undefined) {
        $propertyClass.Events = CoreClassEvents
      }
      // Class Instantiator
      if($propertyClass.ClassInstantiator === undefined) {
        $propertyClass.ClassInstantiator = CoreClassInstantiator 
      }
      // Class Deinstantiator
      if($propertyClass.ClassDeinstantiator === undefined) {
        $propertyClass.ClassDeinstantiator = CoreClassDeinstantiator 
      }
      const { Events, Names } = $propertyClass
      const propertyClassStoreName = `_${propertyClassName}`
      Object.defineProperties(this, {
        // Property Class Store
        [propertyClassStoreName]: {
          configurable: true, enumerable: false, writable: true,
          value: undefined,
        },
        // Property Class
        [propertyClassName]: {
          configurable: true, enumerable: true,  
          get() {
            if($this[propertyClassStoreName] !== undefined) {
              return $this[propertyClassStoreName]
            }
            $this[propertyClassStoreName] = new PropertyClass(
              $propertyClass, $this
            )
            return $this[propertyClassStoreName]
          },
          set($propertyClassInstances) {
            const propertyClassInstances = $this[propertyClassName]
            let propertyClassInstancesEntries
            if($propertyClassInstances) {
              if(Array.isArray($propertyClassInstances)) {
                propertyClassInstancesEntries = $propertyClassInstances
              }
              else {
                propertyClassInstancesEntries = Object.entries($propertyClassInstances)
              }
            } else { propertyClassInstancesEntries = [] }
            for(const [
              $propertyClassInstanceName, $propertyClassInstance
            ] of propertyClassInstancesEntries) {
              propertyClassInstances[$propertyClassInstanceName] = $propertyClassInstance
            }
          }
        },
        // Add Property Class Instance
        [`${Names.Minister.Ad.Nonformal}${Names.Multiple.Formal}`]: {
          configurable: true, enumerable: true, writable: false, 
          value: function() {
            const $arguments = [...arguments]
            if($arguments.length === 1) {
              const [$values] = $arguments
              if(Array.isArray($values)) {
                $this[propertyClassName] = Object.fromEntries($values)
              }
              else {
                $this[propertyClassName] = $values
              }
            }
            else if($arguments.length === 2) {
              const [$key, $value] = $arguments
              $this[propertyClassName] = { [$key]: $value }
            }
          }
        },
        // Remove Property Class Instance
        [`${Names.Minister.Dead.Nonformal}${Names.Multiple.Formal}`]: {
          configurable: true, enumerable: true, writable: false, 
          value: function() {
            const [$removeKeys] = [...arguments]
            const removeKeys = []
            const typeofRemoveKeys = typeof $arguments[0]
            if(typeofRemoveKeys === 'string') { removeKeys.push($arguments[0]) }
            else if(typeofRemoveKeys === 'object') {
              if(Array.isArray($removeKeys)) { removeKeys.push(...$removeKeys) }
              else { removeKeys.push(...Object.keys($removeKeys)) }
            }
            else if(typeofRemoveKeys === 'undefined') {
              removeKeys.push(...Object.keys($this[propertyClassName]))
            }
            for(const $removeKey of $removeKeys) {
              delete $this[propertyClassName][$removeKey]
            }
          }
        },
      })
      propertyClasses.push($propertyClass)
    }
    return this
  }
  removePropertyClasses() {
    let removePropertyClasses = []
    if(arguments.length === 0) { removePropertyClasses = removePropertyClasses.concat(
      Object.keys(this.propertyClasses)
    ) }
    else if(arguments.length === 1) {
      const $removePropertyClasses = arguments[0]
      const typeofRemovePropertyClasses = typeof $removePropertyClasses
      if(
        typeofRemovePropertyClasses === 'string'
      ) {
        removePropertyClasses = removePropertyClasses.concat($removePropertyClasses)
      }
      else if(typeofRemovePropertyClasses === 'object') {
        if(Array.isArray($removePropertyClasses)) {
          removePropertyClasses = removePropertyClasses.concat($removePropertyClasses)
        }
        else {
          removePropertyClasses = removePropertyClasses.concat(Object.keys($removePropertyClasses))
        }
      }
    }
    iterateRemovePropertyClasses: 
    for(const $removePropertyClassName of removePropertyClasses) {
      const { Names } = this.getPropertyClass({ Name: $removePropertyClassName })
      if(!Names) break iterateRemovePropertyClasses
      const propertyClassInstances = this[Names.Multiple.Nonformal]
      iteratePropertyClassInstances: 
      for(const [
        $propertyClassInstanceName, $propertyClassInstance
      ] of Object.entries(this[Names.Multiple.Nonformal])) {
        delete propertyClassInstances[$propertyClassInstanceName]
      }
      delete this[`_${Names.Multiple.Nonformal}`]
      Object.defineProperty(this, Names.Multiple.Nonformal, {
        configurable: true, enumerable: false, writable: true, 
        value: undefined
      })
      delete this[Names.Multiple.Nonformal]
      delete this[`${Names.Minister.Ad.Nonformal}${Names.Multiple.Formal}`]
      delete this[`${Names.Minister.Dead.Nonformal}${Names.Multiple.Formal}`]
    }
    return this
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
      const propertyClassEvents = (this.#propertyClassEvents[propertyClassName])
        ? this.#propertyClassEvents[propertyClassName] 
        : CoreClassEvents
      $event = Object.assign({}, $event, {
        context: this,
        propertyClassEvents,
      })
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
  #assign() {
    Object.assign(this, ...arguments)
    return this
  }
  #defineProperties() {
    Object.defineProperties(this, arguments[0])
    return this
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