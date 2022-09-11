const validationMiddleware = require('~/middlewares/validation')
const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const signupValidationSchema = require('~/validation/schemas/signup')

describe('Validation middleware', () => {
  const middlewareToTest = validationMiddleware(signupValidationSchema)
  const mockResponse = {}
  const mockNextFunc = jest.fn()

  it('Should throw an error when body is not defined', () => {
    const mockRequest = {}
    const err = createError(422, BODY_IS_NOT_DEFINED)
    const middlewareFunc = () => middlewareToTest(mockRequest, mockResponse, mockNextFunc)

    expect(middlewareFunc).toThrow(err)
  })
})
