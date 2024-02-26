const { request } = require('express')
const { INVALID_LANGUAGE } = require('~/consts/errors')
const langMiddleware = require('~/middlewares/appLanguage')
const { createError } = require('~/utils/errorsHelper')

describe('Language middleware', () => {
  let mockResponse = {}
  let mockNextFunc = jest.fn()
  const acceptsLanguages = jest.fn(request.acceptsLanguages)

  it('Should have English language set by default', () => {
    const mockRequest = {
      headers: {},
      acceptsLanguages
    }
    langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(mockRequest.lang).toBe('en')
  })

  it('Should have Ukranian language set from query param', () => {
    const mockRequest = {
      headers: {
        'accept-language': 'ua'
      },
      acceptsLanguages
    }
    langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(mockRequest.lang).toBe('ua')
  })

  it('Should throw an error when an invalid language is used', () => {
    const mockRequest = {
      headers: {
        'accept-language': 'invalid'
      },
      acceptsLanguages
    }
    const err = createError(400, INVALID_LANGUAGE)
    const middlewareFunc = () => langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(middlewareFunc).toThrow(err)
  })
})
