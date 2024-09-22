require('~/initialization/envSetup')
const { authSocketMiddleware } = require('~/middlewares/auth')
const { createUnauthorizedError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')

describe('Auth socket midleware', () => {
  const error = createUnauthorizedError()
  const mockNextFunc = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should call the next function with UNAUTHORIZED error when cookies are not given', () => {
    const mockSocket = { request: { headers: {} } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(error)
  })

  it('Should call the next function with UNAUTHORIZED error when access token is not given', () => {
    const mockSocket = { request: { headers: { cookie: '' } } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(error)
  })

  it('Should call the next function with UNAUTHORIZED error when access token is empty', () => {
    const mockSocket = { request: { headers: { cookie: 'accessToken=;' } } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(error)
  })

  it('Should call the next function with UNAUTHORIZED error when access token is invalid', () => {
    const mockSocket = { request: { headers: { cookie: 'accessToken=invalid_token;' } } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(error)
  })

  it('Should save userData from accessToken to a socket object', () => {
    const payload = { userId: 'testId' }
    const { accessToken } = tokenService.generateTokens(payload)
    const mockSocket = { request: { headers: { cookie: `accessToken=${accessToken};` } } }

    authSocketMiddleware(mockSocket, mockNextFunc)

    expect(mockSocket.user).toEqual(expect.objectContaining(payload))
  })
})
