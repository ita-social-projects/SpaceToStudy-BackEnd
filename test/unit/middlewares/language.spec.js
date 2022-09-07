const { INVALID_LANGUAGE } = require('~/consts/errors')
const langMiddleware = require('~/middlewares/language')
const { createError } = require('~/utils/errorsHelper')

describe('Language middleware', () => {
  let mockResponse = {}
  let mockNextFunc = jest.fn()

  it('Should have English language set by default', () => {
    const mockRequest = {
      query: {}
    }
    langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(mockRequest.lang).toBe('en')
  })

  it('Should have Ukranian language set from query param', () => {
    const mockRequest = {
      query: { lang: 'ua' }
    }
    langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(mockRequest.lang).toBe('ua')
  })

  it('Should throw an error when an invalid language is used', () => {
    const mockRequest = {
      query: { lang: 'invalid' }
    }
    const err = createError(400, INVALID_LANGUAGE)
    const middlewareFunc = () => langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(middlewareFunc).toThrow(err)
  })
})
