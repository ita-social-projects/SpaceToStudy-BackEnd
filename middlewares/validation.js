const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateType, validateLength } = require('~/utils/validationHelper')

const validationMiddleware = (schema) => {
  return function validation(req, _res, next) {
    try {
      const { body } = req
      if (!body) {
        throw createError(422, BODY_IS_NOT_DEFINED)
      }
      for (const schemaField of Object.entries(schema)) {
        const field = body[schemaField[0]]
        validateRequired(schemaField, field)
        if (field) {
          validateType(schemaField, field)
          validateLength(schemaField, field)
        }
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = validationMiddleware
