const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateFunc } = require('~/utils/validationHelper')

const validationMiddleware = (schema) => {
  return (req, _res, next) => {
    const { body } = req
    if (!body) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }

    Object.entries(schema).forEach((schemaField) => {
      const reqBodyField = body[schemaField[0]]
      validateRequired(schemaField, reqBodyField)
      if (reqBodyField) {
        Object.entries(schemaField[1]).forEach((validationType) => {
          validateFunc[validationType[0]](schemaField, reqBodyField)
        })
      }
    })

    next()
  }
}

module.exports = validationMiddleware
