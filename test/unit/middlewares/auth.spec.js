require('~/app/initialization/envSetup')
const { authMiddleware } = require('~/app/middlewares/auth')
const { createUnauthorizedError } = require('~/app/utils/errorsHelper')
const tokenService = require('~/app/services/token')

describe('Auth middleware', () => {
  const error = createUnauthorizedError()
  const mockResponse = {}
  const mockNextFunc = jest.fn()

  it('Should throw UNAUTHORIZED error when access token is not given', () => {
    const mockRequest = { cookies: { accessToken: 'invalid_token' } }

    const middlewareFunc = () => authMiddleware(mockRequest, mockResponse, mockNextFunc)

    expect(middlewareFunc).toThrow(error)
  })

  it('Should throw UNAUTHORIZED error when access token is invalid', () => {
    const mockRequest = { cookies: { accessToken: 'token' } }

    const middlewareFunc = () => authMiddleware(mockRequest, mockResponse, mockNextFunc)

    expect(middlewareFunc).toThrow(error)
  })

  it('Should save userData from accessToken to a request object', () => {
    const payload = { userId: 'testId' }
    const { accessToken } = tokenService.generateTokens(payload)
    const mockRequest = { cookies: { accessToken } }

    authMiddleware(mockRequest, mockResponse, mockNextFunc)

    expect(mockRequest.user).toEqual(expect.objectContaining(payload))
  })
})
