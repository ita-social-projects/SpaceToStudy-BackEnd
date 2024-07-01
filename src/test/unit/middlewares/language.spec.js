const { request } = require('express')
const {
  enums: { APP_LANG_DEFAULT }
} = require('~/consts/validation')
const langMiddleware = require('~/middlewares/appLanguage')

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
        'accept-language': 'uk'
      },
      acceptsLanguages
    }
    langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(mockRequest.lang).toBe('uk')
  })

  it('Should choose default language when the expected language is not used', () => {
    const mockRequest = {
      headers: {
        'accept-language': 'polish'
      },
      acceptsLanguages
    }
    langMiddleware(mockRequest, mockResponse, mockNextFunc)
    expect(mockRequest.lang).toBe(APP_LANG_DEFAULT)
  })
})
