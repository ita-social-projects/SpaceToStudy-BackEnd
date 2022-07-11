const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateType, validateLength } = require('~/utils/validationHelper')

const validationMiddleware = (schema) => {
  return (req, _res, next) => {
    const { body } = req
    if (!body) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }
    for (const schemaField of Object.entries(schema)) {
      const reqBodyField = body[schemaField[0]]
      validateRequired(schemaField, reqBodyField)
      if (reqBodyField) {
        validateType(schemaField, reqBodyField)
        validateLength(schemaField, reqBodyField)
      }
    }

    next()
  }
}

module.exports = validationMiddleware
