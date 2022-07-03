const { createUnauthorizedError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

const authMiddleware = (req, _res, next) => {
  const authorizationHeader = req.headers.Authorization
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

module.exports = authMiddleware
