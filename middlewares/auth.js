const { createUnauthorizedError, createForbiddenError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

const authMiddleware = (req, _res, next) => {
  const { accessToken } = req.cookies

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
