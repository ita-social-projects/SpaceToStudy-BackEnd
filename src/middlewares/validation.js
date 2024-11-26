const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateFunc } = require('~/utils/validationHelper')
const requestDataSource = require('~/consts/requestDataSource')

const validationMiddleware = (schema, source = requestDataSource.BODY) => {
  return (req, _res, next) => {
    const data = req[source]

    if (!data && source === requestDataSource.body) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }

    Object.entries(schema).forEach(([schemaFieldKey, schemaFieldValue]) => {
      const reqSourceField = data[schemaFieldKey]
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
