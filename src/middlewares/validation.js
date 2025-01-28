const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateSchema } = require('~/utils/validation/schemaValidators')
const requestDataSource = require('~/consts/requestDataSource')

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
