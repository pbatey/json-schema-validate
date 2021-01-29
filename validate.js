import jsonMap from 'json-source-map'
import Ajv from 'ajv/dist/2019'
import ajvFormats from 'ajv-formats'
import banUnknownProperties from './banUnknownProperties'

const defaultAjv = new Ajv.default() // constructor weirdness with --es-module-specifier-resolution=node
ajvFormats(defaultAjv)

/**
 * Valiate a JSON Object against a JSON-Schema object.
 *
 * @params {string|*} v Value to validate against schema. Strings will be parsed as JSON.
 * @params {object} schema A JSON-Schema to validate with
 * @params {boolean} strict If set, ban unknown properties by setting additionalProperties to false
 * @params {object=} ajv An Ajv instance
 * @return {array} Array of errors or null
 */
const validate = (v, schema, strict, ajv=defaultAjv) => {
  var json = typeof v == 'object' && v
  if (strict) schema = banUnknownProperties(schema)
  var errors
  var pointers
  
  if (!json) {
    try {
      const result = jsonMap.parse(v)
      json = result.data
      pointers = result.pointers
    } catch (err) {
      console.error(err)
      errors = [{message: err.message}]
    }
  }
  
  if (json) {
    const isValid = ajv.compile(schema)
    if (!isValid(json)) errors = isValid.errors.map(err => ({...err, pointer: pointers && pointers[err.dataPath]}))
  }
  return errors
}

export default validate
