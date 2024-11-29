const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateFunc } = require('~/utils/validationHelper')
const requestDataSource = require('~/consts/requestDataSource')

const validateSchema = (schema, data) => {
  Object.entries(schema).forEach(([schemaFieldKey, schemaFieldValue]) => {
    const reqSourceField = data?.[schemaFieldKey]
    validateRequired(schemaFieldKey, schemaFieldValue?.required, reqSourceField)

    if (reqSourceField) {
      if (typeof schemaFieldValue === 'object' && schemaFieldValue.properties) {
        validateSchema(schemaFieldValue.properties, reqSourceField)
      } else {
        Object.entries(schemaFieldValue).forEach(([validationType, validationValue]) => {
          if (validateFunc[validationType]) {
            validateFunc[validationType](schemaFieldKey, validationValue, reqSourceField)
          }
        })
      }
    }
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
