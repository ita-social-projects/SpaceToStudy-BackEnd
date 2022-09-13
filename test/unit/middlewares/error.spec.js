const { INTERNAL_SERVER_ERROR } = require('~/consts/errors')
const errorMiddleware = require('~/middlewares/error')
const { createNotFoundError } = require('~/utils/errorsHelper')

describe('Error middleware', () => {
  const jsonFunc = jest.fn()
  let mockResponse = {
    status: jest.fn((_status) => ({
      json: jsonFunc
    }))
  }
  const mockRequest = {}
  const mockNextFunc = jest.fn()

  it('Should return the given error status & message', () => {
    const errorToTest = createNotFoundError()
    const { status, code, message } = errorToTest
    errorMiddleware(errorToTest, mockRequest, mockResponse, mockNextFunc)

    expect(jsonFunc).toBeCalledWith({ status, code, message })
  })

  it('Should return the given INTERNAL_SERVER_ERROR if no error was given', () => {
    const message = 'Server-specific error message.'
    const status = 500
    errorMiddleware({ message }, mockRequest, mockResponse, mockNextFunc)

    expect(jsonFunc).toBeCalledWith({ status, message, ...INTERNAL_SERVER_ERROR })
  })
})
