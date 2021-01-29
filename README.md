# json-schema-validate

Validate JSON against a JSON-Schema

This project uses [ajv](https://ajv.js.org/), [ajv-formats](https://github.com/ajv-validator/ajv-formats), and
[json-source-map](https://github.com/epoberezkin/json-source-map) to validate a JSON object and provide
error messages with line, column, and pos information.

I've also implemented a hack to add a **banUnknownProperties** feature.

## Command Line Usage

```
git clone git@github.com:pbatey/json-schema-validate.git
cd json-schema-validate
npm install
npm run cli example.json example.schema.json
```

Example Output

```
$ npm run cli example.json example.schema.json

> json-schema-validate@1.0.0 cli /Users/pbatey200/src/github.com/pbatey/json-schema-validate
> node --es-module-specifier-resolution=node cli.js "example.json" "example.schema.json"

🍻 example.json is valid but has unknown properties
[
  {
    "keyword": "additionalProperties",
    "dataPath": "",
    "schemaPath": "#/additionalProperties",
    "params": {
      "additionalProperty": "timestamp"
    },
    "message": "should NOT have additional properties",
    "pointer": {
      "value": {
        "line": 0,
        "column": 0,
        "pos": 0
      },
      "valueEnd": {
        "line": 9,
        "column": 1,
        "pos": 322
      }
    }
  }
]
```

## Install as an npm dependancy

I thought about publishing this as an npm package, but there's already a bunch of packages for json schema validation.
I didn't want to add to the confusion, and one is already named **json-schema-validate** -- I didn't have it in me to
come up with another name right now.

Let me know if you think I should reconsider. I'd appreciate any name suggestions.

```
npm i git+ssh://git@github.com:pbatey/json-schema-validate.git#semver:^1.0
```

## Using the API

This is an example of using the API from Node.js -- I _believe_ it'll work in a browser since ajv and json-source-map do,
but haven't tried it.

```
import validate from 'json-schema-validate'
import fs from 'fs'

const jsonText = fs.readFileAsync('./example.json').toString()
const jsonSchema = JSON.parse(fs.readFileAsync('./example.schema.json').toString())

const banUnknownProperties = true
const errors = validate(jsonText, jsonSchema, banUnknownProperties)
```

### Specifying Ajv Options

The Ajv instance created in ***validate.js*** specifies no options. In order to specify options, or add multiple schemas, specify an Ajv instance.

```
import Ajv from 'ajv/dist/2019'
import ajvFormats from 'ajv-formats'
import validate from 'json-schema-validate'

const ajvOptions = { allErrors: true }
const ajv = new Ajv.default(ajvOptions) // constructor weirdness
ajvFormats(ajv)

... read jsonTexta and jsonSchema ...

validate(jsonText, jsonSchema)

```

_Note:_ I ran into weirdness with the Ajv constructor using Node.js and the `--es-module-specifier-resolution=node` flag. Had to use `new Ajv.default()` to construct an instance. Your mileage may vary.

## API Documentation

#### validate(json, schema, strict, ajv)

Validates JSON against a JSON-Schema, appending pointer information (line, column, pos) to returned errors if _json_
is provided as a string.

_defined in **validate.js**_

|   |   |   |
|---|---|---|
| **Parameters**    | **Name** | **Description** |
| `{string|object}` | json   | JSON to validate. A string will be parsed as JSON.
| `{object}`        | schema | A JSON-Schema
| `{boolean}`       | strict | If set, _schema_ will be adjusted to ban unknown properties
| `{boolean}`       | strict | _Optional._ An Ajv instance. Will use a vanilla instance w/ ajvformat if not provided.
| **Returns** |**Name** |**Description** |
| `{array|null}` | errors| An array of Ajv errors decorated with a pointer field from json-source-map

#### banUnknownProperties(schema)

Forces additionalProperties to false within a JSON-Schema definition.

Returns a shallow copy of the schema with shallow copy of nodes that have been modified so that the original _schema_ value is unchanged, but this _should not_ be used as a deep-copy.

_defined in **banUnknownProperties.js**_

|   |   |   |
|---|---|---|
| **Parameters**    | **Name** | **Description** |
| `{object}`        | schema | A JSON-Schema
| **Returns** |**Name** |**Description** |
| `{object}` | adjustedSchema | An adjusted version of the schema that sets additionalProperties to false
