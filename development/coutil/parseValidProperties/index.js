export default function parseValidProperties($properties, $validPropertyKeys) {
  const properties = {}
  if($properties) {
    iteratePropertyKeys: 
    for(const $inputOptionKey of $validPropertyKeys) {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(
        $properties, $inputOptionKey
      )
      if(propertyDescriptor) {
        properties[$inputOptionKey] = propertyDescriptor.value
      }
    }
  }
  return properties
}