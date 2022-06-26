const { createUnauthorizedError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

const authMiddleware = (req, _res, next) => {
  try {
    const authorizationHeader = req.headers.Authorization
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
  } catch (err) {
    return next(createUnauthorizedError())
  }
}

module.exports = authMiddleware
