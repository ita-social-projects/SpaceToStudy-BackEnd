const { createError } = require('~/app/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/app/consts/errors')
const { validateRequired, validateFunc } = require('~/app/utils/validationHelper')

const validationMiddleware = (schema) => {
  return (req, _res, next) => {
    const { body } = req
    if (!body) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }

    Object.entries(schema).forEach(([schemaFieldKey, schemaFieldValue]) => {
      const reqBodyField = body[schemaFieldKey]
      validateRequired(schemaFieldKey, schemaFieldValue?.required, reqBodyField)
      if (reqBodyField) {
        Object.entries(schemaFieldValue).forEach(([validationType, validationValue]) => {
          validateFunc[validationType](schemaFieldKey, validationValue, reqBodyField)
        })
      }
    })

    next()
  }
}

module.exports = validationMiddleware
