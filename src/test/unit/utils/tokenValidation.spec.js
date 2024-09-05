const tokenService = require('~/services/token')
const validateUserToken = require('~/utils/users/tokenValidation')
const ValidationError = require('~/consts/errors')

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
      end: jest.fn()
    }

    tokenService.validateAccessToken = jest.fn()

    jest.clearAllMocks()
  })

  it('should return 401 if no access token is provided', () => {
    validateUserToken(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.end).toHaveBeenCalled()
  })

  it('should return 401 if token is invalid', () => {
    req.cookies.accessToken = 'invalidToken'
    tokenService.validateAccessToken.mockReturnValue(null)

    validateUserToken(req, res)

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('invalidToken')
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.end).toHaveBeenCalled()
  })

  it('should return ValidationError if userId does not match', () => {
    req.cookies.accessToken = 'validToken'
    req.params.userId = '123'
    tokenService.validateAccessToken.mockReturnValue({ id: '456' })

    const result = validateUserToken(req, res)

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('validToken')
    expect(result).toBe(ValidationError)
  })

  it('should return decoded token if valid and userId matches', () => {
    req.cookies.accessToken = 'validToken'
    req.params.userId = '123'
    const decodedToken = { id: '123' }
    tokenService.validateAccessToken.mockReturnValue(decodedToken)

    const result = validateUserToken(req, res)

    expect(tokenService.validateAccessToken).toHaveBeenCalledWith('validToken')
    expect(result).toBe(decodedToken)
  })
})
