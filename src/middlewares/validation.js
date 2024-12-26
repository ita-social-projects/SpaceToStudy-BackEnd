const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateNonEmptyObject, validateFunc } = require('~/utils/validationHelper')
const requestDataSource = require('~/consts/requestDataSource')

const isExpectedType = (expectedType, valueToCheck) => {
  return Array.isArray(valueToCheck) ? valueToCheck.includes(expectedType) : valueToCheck === expectedType
}

const validateSchema = (schema, data) => {
  Object.entries(schema).forEach(([schemaFieldKey, schemaFieldValue]) => {
    const reqSourceField = data[schemaFieldKey]
    validateRequired(schemaFieldKey, schemaFieldValue?.required, reqSourceField)

    if (!reqSourceField) {
      return
    }

    if (
      typeof reqSourceField === 'object' &&
      isExpectedType('object', schemaFieldValue?.type) &&
      schemaFieldValue.properties
    ) {
      validateNonEmptyObject(reqSourceField, schemaFieldKey)

      validateSchema(schemaFieldValue.properties, reqSourceField)
      return
    }

    Object.entries(schemaFieldValue).forEach(([validationType, validationValue]) => {
      if (validateFunc[validationType]) {
        validateFunc[validationType](schemaFieldKey, validationValue, reqSourceField)
      }
    })
  })
}

const validationMiddleware = (schema, source = requestDataSource.BODY) => {
  return (req, _res, next) => {
    if (source === requestDataSource.BODY && !req[source]) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }

    const data = req[source]
    validateSchema(schema, data)

    next()
  }
}

module.exports = validationMiddleware
