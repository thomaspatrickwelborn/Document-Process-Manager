import Core from '../../index.js'
import { CoreClassInstantiator } from '../../PropertyInstantiators/index.js'
export default class Handler {
  #propertyClass
  constructor($propertyClass) {
    this.#propertyClass = $propertyClass
  }
  get get() {
    return function($target, $property) {
      return $target[$property]
    }
  }
  get set() {
    const { ClassInstantiator } = this.#propertyClass
    return function($target, $property, $value) {
      $target[$property] = ClassInstantiator(this.#propertyClass, $property, $value)
      return true
    }
  }
  get deleteProperty() {
    const { ClassDeinstantiator } = this.#propertyClass
    return function($target, $property) {
      ClassDeinstantiator(this.#propertyClass, $property)
      delete $target[$property]
      return true
    }
  }
}