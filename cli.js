import fs from 'fs'
import validate from './validate'
import Ajv from 'ajv/dist/2019'
import ajvFormats from 'ajv-formats'

const vomit = '🤮'
const cheers = '🍻'
const negative = x => `\x1b[0;31m${x}\x1b[0;m`
const positive = x => `\x1b[0;32m${x}\x1b[0;m`
const warning = x => `\x1b[0;33m${x}\x1b[0;m`

const ajv = new Ajv.default({ allErrors: true }) // constructor weirdness
ajvFormats(ajv)

const [jsonFile, schemaFile] = process.argv.slice(2)
var json, schema, errors

if (!jsonFile || !schemaFile) {
  console.log(negative('Usage: npm run cli <json-file> <schema-file>'))
  process.exit(1)
}

try {
  json = fs.readFileSync(jsonFile).toString()
} catch (err) {
  console.log(`Could not read json file: ${negative(jsonFile)} ${vomit}`)
  process.exit(1)
}

try {
  schema = JSON.parse(fs.readFileSync(schemaFile.toString()))
} catch (err) {
  console.log(`Could not read schema file: ${negative(schemaFile)} ${vomit}`)
  process.exit(1)
}

errors = validate(json, schema, false, ajv)
if (errors) {
  console.log(`${vomit} ${jsonFile} is ${negative('invalid')}`)
  console.log(JSON.stringify(errors, null, 2))
  process.exit(1)
}

errors = validate(json, schema, true, ajv)
if (errors) {
  console.log(`${cheers} ${jsonFile} is ${positive('valid')} but has ${warning('unknown properties')}`)
  console.log(JSON.stringify(errors, null, 2))
} else {
  console.log(`${cheers} ${jsonFile} is ${positive('valid')}`)
}
