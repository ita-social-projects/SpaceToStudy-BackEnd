const { createUnauthorizedError, createForbiddenError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

const authMiddleware = (req, _res, next) => {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader) {
    throw createUnauthorizedError()
  }

  const accessToken = authorizationHeader.split(' ')[1]
  if (!accessToken) {
    throw createUnauthorizedError()
  }

  const userData = tokenService.validateAccessToken(accessToken)
  if (!userData) {
    throw createUnauthorizedError()
  }

  req.user = userData
  next()
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createForbiddenError())
    }
    next()
  }
}

module.exports = { authMiddleware, restrictTo }
