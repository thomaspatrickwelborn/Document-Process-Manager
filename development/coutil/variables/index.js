const Primitives = {
  'string': String, 
  'number': Number, 
  'boolean': Boolean, 
  'undefined': undefined,
  'null': null,
}
const PrimitiveKeys = Object.keys(Primitives)
const PrimitiveValues = Object.values(Primitives)
const Objects = {
  'object': Object,
  'array': Array,
}
const ObjectKeys = Object.keys(Objects)
const ObjectValues = Object.values(Objects)
const Types = Object.assign({}, Primitives, Objects)
const TypeKeys = Object.keys(Types)
const TypeValues = Object.values(Types)
const TypeMethods = [
 Primitives.String, Primitives.Number, Primitives.Boolean, 
 Objects.Object, Objects.Array
]
export {
  Primitives, PrimitiveKeys, PrimitiveValues, 
  Objects, ObjectKeys, ObjectValues,
  Types, TypeKeys, TypeValues, TypeMethods
}
