const { createUnauthorizedError, createForbiddenError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

const authMiddleware = (req, _res, next) => {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader) {
    return next(createUnauthorizedError())
  }

  const accessToken = authorizationHeader.split(' ')[1]
  if (!accessToken) {
    return next(createUnauthorizedError())
  }

  const userData = tokenService.validateAccessToken(accessToken)
  if (!userData) {
    return next(createUnauthorizedError())
  }

  req.user = userData
  next()
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createForbiddenError())
    }
  }
}

module.exports = { authMiddleware, restrictTo }
