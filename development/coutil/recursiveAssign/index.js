function recursiveAssign() {
  const $arguments = [...arguments]
  const $target = $arguments.shift()
  const $sources = $arguments
  iterateSources: 
  for(const $source of $sources) {
    if(
      $source === null ||
      $source === undefined
    ) { continue iterateSources }
    iterateSourceEntries: 
    for(let [
      $sourcePropKey, $sourcePropValue
    ] of Object.entries($source)) {
      // Type: Non-Null Object
      if(
        $target[$sourcePropKey] !== null &&
        typeof $sourcePropValue === 'object'
      ) {
        let targetPropValue
        if($target[$sourcePropKey] === undefined) {
          $target[$sourcePropKey] = $sourcePropValue
        } else {
          $target[$sourcePropKey] = recursiveAssign(
            $target[$sourcePropKey], $sourcePropValue
          )
        }
      }
      // Type: Primitive
      else {
        $target[$sourcePropKey] = $sourcePropValue
      }
    }
  }
  return $target
}
export default recursiveAssign