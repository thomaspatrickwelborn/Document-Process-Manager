import { typeOf } from "recourse"
export default function typedObjectLiteral($object) {
  if(typeOf($object) === 'object') { return {} }
  else if(typeOf($object) === 'array') { return [] }
  else if(typeOf($object) === 'string') { return (
    $object === 'object'
  ) ? {} : (
    $object === 'array'
  ) ? []
    : undefined
  }
  else { return undefined }
}