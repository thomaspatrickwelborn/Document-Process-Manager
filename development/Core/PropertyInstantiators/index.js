// Core Class Instantiation
function CoreClassInstantiator($propertyClass, $property, $value) {
  const { core, target, Class, Names } = $propertyClass
  const valueInstanceOfClass = $value instanceof Class
  let value
  const parent = core
  const path = (core.path)
    ? [core.path, Names.Multiple.Nonformal, $property].join('.')
    : [Names.Multiple.Nonformal, $property].join('.')
  if(valueInstanceOfClass === false) {
    const propertyClassInstanceParameters = [].concat($value)
    const $settings = Object.assign({ path, parent }, propertyClassInstanceParameters.shift())
    const $options = propertyClassInstanceParameters.shift()
    value = new Class($settings, $options)
  }
  else if(valueInstanceOfClass === true) {
    if($value.parent === undefined && $value.path === undefined) {
      $value.parent = parent
      $value.path = path
    }
    value = $value
  }
  return value
}
// Core Class Deinstantiation
function CoreClassDeinstantiator($propertyClass, $property) {
  const { target } = $propertyClass
  // NOOP
  return target[$property]
}
export {
  CoreClassInstantiator,
  CoreClassDeinstantiator,
}