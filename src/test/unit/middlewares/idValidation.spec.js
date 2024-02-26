const idValidation = require('~/middlewares/idValidation')
const { createError } = require('~/utils/errorsHelper')
const { INVALID_ID } = require('~/consts/errors')

describe('idValidation middleware', () => {
  const mockResponse = {}
  const mockRequest = {}
  const mockNextFunc = jest.fn()

  it('Should throw an error when id is invalid', () => {
    const id = 'invalid'
    const err = createError(400, INVALID_ID)
    const middlewareFunc = () => idValidation(mockRequest, mockResponse, mockNextFunc, id)

    expect(middlewareFunc).toThrow(err)
  })
})
