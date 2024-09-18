require('~/initialization/envSetup')
const { authSocketMiddleware } = require('~/middlewares/auth')
const { createUnauthorizedError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

describe('Auth socket midleware', () => {
  const error = createUnauthorizedError()
  const mockNextFunc = jest.fn()

  it('Should call next function with UNAUTHORIZED error when access token is not given', () => {
    const mockSocket = { handshake: { auth: {} } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(error)
  })

  it('Should call next function with UNAUTHORIZED error when access token is not given', () => {
    const mockSocket = { handshake: { auth: { token: 'invalid_token' } } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(error)
  })

  it('Should save userData from accessToken to a socket object', () => {
    const payload = { userId: 'testId' }
    const { accessToken } = tokenService.generateTokens(payload)
    const mockSocket = { handshake: { auth: { token: accessToken } } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockSocket.user).toEqual(expect.objectContaining(payload))
  })
})
