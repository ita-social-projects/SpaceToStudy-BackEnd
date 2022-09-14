require('~/initialization/envSetup')
const Token = require('~/models/token')
const tokenService = require('~/services/token')
const {
  tokenNames: { RESET_TOKEN }
} = require('~/consts/auth')
const { createError } = require('~/utils/errorsHelper')
const { INVALID_TOKEN_NAME } = require('~/consts/errors')

describe('Token service', () => {
  const data = { id: 'testExample' }
  const tokenValue = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ8'
  const userId = '631f8e5e587794b884b75483'

  it('Should validate access token', () => {
    const { accessToken } = tokenService.generateTokens(data)
    const testData = tokenService.validateAccessToken(accessToken)

    expect(testData).toEqual(expect.objectContaining(data))
  })
  it('Should set new token value', async () => {
    const obj = { resetToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' }
    const tokenData = { resetToken: tokenValue }
    Token.findOne = jest.fn().mockResolvedValue({ ...obj, save: jest.fn().mockResolvedValue(tokenData) })
    const result = await tokenService.saveToken(userId, tokenValue, RESET_TOKEN)

    expect(result).toEqual(tokenData)
  })
  it('Should throw error INVALID_TOKEN_NAME in saveToken func', () => {
    const tokenName = 'invalid'
    const err = createError(404, INVALID_TOKEN_NAME)
    const serviceFunc = () => tokenService.saveToken(userId, tokenValue, tokenName)

    expect(serviceFunc).rejects.toThrow(err)
  })
  it('Should throw error INVALID_TOKEN_NAME in findToken func', () => {
    const tokenName = 'invalid'
    const err = createError(404, INVALID_TOKEN_NAME)
    const serviceFunc = () => tokenService.findToken(tokenValue, tokenName)

    expect(serviceFunc).rejects.toThrow(err)
  })
})
