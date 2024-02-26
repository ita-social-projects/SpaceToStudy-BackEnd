const { UNAUTHORIZED, NOT_FOUND, FORBIDDEN, BAD_REQUEST } = require('~/consts/errors')

const createError = (status, errorInfo) => {
  const err = new Error(errorInfo.message)
  err.status = status
  err.code = errorInfo.code

  return err
}

const createUnauthorizedError = () => {
  return createError(401, UNAUTHORIZED)
}

const createForbiddenError = () => {
  return createError(403, FORBIDDEN)
}

const createNotFoundError = () => {
  return createError(404, NOT_FOUND)
}

const createBadRequestError = () => {
  return createError(400, BAD_REQUEST)
}

module.exports = {
  createError,
  createUnauthorizedError,
  createNotFoundError,
  createForbiddenError,
  createBadRequestError
}
