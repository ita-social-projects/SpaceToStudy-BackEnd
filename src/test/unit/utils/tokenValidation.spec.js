const tokenService = require('~/services/token')
const validateUserToken = require('~/utils/users/tokenValidation')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')

describe('validateUserToken', () => {
  let req
  let res

  beforeEach(() => {
    req = {
      cookies: {},
      params: {}
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    tokenService.validateAccessToken = jest.fn()

    jest.clearAllMocks()
  })

  it('should return 401 if no access token is provided', () => {
    validateUserToken(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(UNAUTHORIZED)
  })

  it('should return 401 if token is invalid', () => {
    req.cookies.accessToken = 'invalidToken'
    tokenService.validateAccessToken.mockReturnValue(null)

    validateUserToken(req, res)

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('invalidToken')
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(UNAUTHORIZED)
  })

  it('should return 403 if userId does not match', () => {
    req.cookies.accessToken = 'validToken'
    req.params.userId = '123'
    tokenService.validateAccessToken.mockReturnValue({ id: '456' })

    validateUserToken(req, res)

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('validToken')
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(FORBIDDEN)
  })

  it('should return true if accessToken is valid', () => {
    req.cookies.accessToken = 'validToken'
    req.params.id = '123'
    const decodedToken = { id: '123' }
    tokenService.validateAccessToken.mockReturnValue(decodedToken)

    const result = validateUserToken(req, res)

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('validToken')
    expect(result).toBe(true)
  })
})
