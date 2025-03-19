const { validateRequired, validateNonEmptyObject, fieldValidator } = require('./fieldValidators')
const { isExpectedType } = require('./typeHelpers')

const validatePrimitiveSchemaField = (schemaFieldKey, schemaFieldValue, reqSourceField) => {
  Object.entries(schemaFieldValue).forEach(([validationType, validationValue]) => {
    if (fieldValidator[validationType]) {
      fieldValidator[validationType](schemaFieldKey, validationValue, reqSourceField)
    }
  })
}

const validateSchemaField = (schemaFieldKey, schemaFieldValue, reqSourceField) => {
  if (reqSourceField === null && schemaFieldValue.canBeNull) {
    return
  }

  if (
    typeof reqSourceField === 'object' &&
    isExpectedType('object', schemaFieldValue.type) &&
    schemaFieldValue.properties
  ) {
    validateNonEmptyObject(reqSourceField, schemaFieldKey)

    validateSchema(schemaFieldValue.properties, reqSourceField)

    return
  }

  validatePrimitiveSchemaField(schemaFieldKey, schemaFieldValue, reqSourceField)
}

const validateSchema = (schema, data) => {
  Object.entries(schema).forEach(([schemaFieldKey, schemaFieldValue]) => {
    const requestSourceField = data[schemaFieldKey]
    validateRequired(schemaFieldKey, schemaFieldValue.required, requestSourceField)

    if (requestSourceField === undefined) {
      return
    }

    if (Array.isArray(requestSourceField) && isExpectedType('array', schemaFieldValue.type) && schemaFieldValue.items) {
      requestSourceField.forEach((item) => {
        validateSchemaField(`${schemaFieldKey} array item`, schemaFieldValue.items, item)
      })

      return
    }

    validateSchemaField(schemaFieldKey, schemaFieldValue, requestSourceField)
  })
}

module.exports = {
  validateSchema
}
