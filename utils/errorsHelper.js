const { UNAUTHORIZED, WRONG_PATH } = require('~/consts/errors')

const createError = (status, errorInfo) => {
  const err = new Error(errorInfo.message)
  err.status = status
  err.code = errorInfo.code

  return err
}

const createUnauthorizedError = () => {
  return createError(401, UNAUTHORIZED)
}

const createNotFoundError = () => {
  return createError(404, WRONG_PATH)
}

module.exports = {
  createError,
  createUnauthorizedError,
  createNotFoundError
}
