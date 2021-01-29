/**
 * Forces additionalProperites to be false within a JSON-Schema definition.
 * 
 * Returns a shallow copy of the schema with deep copy of nodes that have been modified so that the original
 * value is unchanged, but this should not be used as a deep-copy.
 * 
 * @param {object} schemaNode A JSON-Schema node
 * @param {string} newId Adjust the schema $id to this value.
 * @param {number} depth Used to detect recursion. Not usually provided.
 * @returns {object} An adjusted JSON-Schema.
 */
const banUnknownProperties = (schemaNode, newId, depth=0) => {
  if (!schemaNode) return schemaNode
  if (depth === 0) {
    schemaNode = {...schemaNode, '$id': newId}
    Object.keys(schemaNode).forEach(key=>{
      // look through additional object properties at top since they might be a $ref container
      if (typeof schemaNode[key] === 'object' && ['properties'].indexOf(key) < 0) {
        Object.keys(schemaNode[key]).forEach(j => {
          schemaNode[key][j] = banUnknownProperties(schemaNode[key][j], null, depth+1)
        })
      }
    })
  }
  if (schemaNode.properties) {
    if (schemaNode.additionalProperties) {
      schemaNode.additionalProperties = banUnknownProperties(schemaNode.additionalProperties, null, depth+1)
    } else {
      if (depth > 0) schemaNode = {...schemaNode}
      schemaNode.additionalProperties = false
    }
    Object.keys(schemaNode.properties).forEach(k => {
      schemaNode.properties[k] = banUnknownProperties(schemaNode.properties[k], null, depth+1)
    })
  }
  if (schemaNode.items) {
    schemaNode.items = banUnknownProperties(schemaNode.items, null, depth+1)
  }
  ['oneOf', 'allOf', 'anyOf'].forEach(key => {
    if (schemaNode[key]) {
      schemaNode[key] = schemaNode[key].map(banUnknownProperties, null, depth+1)
    }
  })
  return schemaNode
}

export default banUnknownProperties
