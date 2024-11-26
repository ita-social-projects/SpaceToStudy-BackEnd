const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateFunc } = require('~/utils/validationHelper')
const requestDataSource = require('~/consts/requestDataSource')

const validationMiddleware = (schema, source = requestDataSource.BODY) => {
  return (req, _res, next) => {
    if (source === requestDataSource.BODY && !req[source]) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }

    const data = req[source]

    Object.entries(schema).forEach(([schemaFieldKey, schemaFieldValue]) => {
      const reqSourceField = data?.[schemaFieldKey]
      validateRequired(schemaFieldKey, schemaFieldValue?.required, reqSourceField)
      if (reqSourceField) {
        Object.entries(schemaFieldValue).forEach(([validationType, validationValue]) => {
          validateFunc[validationType](schemaFieldKey, validationValue, reqSourceField)
        })
      }
    })

    next()
  }
}

module.exports = validationMiddleware
