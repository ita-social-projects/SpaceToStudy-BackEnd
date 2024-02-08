require('~/app/initialization/envSetup')
const Token = require('~/app/models/token')
const tokenService = require('~/app/services/token')
const {
  tokenNames: { RESET_TOKEN }
} = require('~/app/consts/auth')
const { createError } = require('~/app/utils/errorsHelper')
const { INVALID_TOKEN_NAME } = require('~/app/consts/errors')

jest.mock('~/app/configs/config', () => ({
  config: {
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_ACCESS_EXPIRES_IN: '1h',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_REFRESH_EXPIRES_IN: '7d'
  }
}))

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
    const mockSave = jest.fn().mockResolvedValue(tokenData)

    Token.findOne = jest
      .fn()
      .mockResolvedValue({ ...obj })
      .mockImplementation(() => ({ exec: jest.fn().mockResolvedValue({ save: mockSave }) }))

    const result = await tokenService.saveToken(userId, tokenValue, RESET_TOKEN)

    expect(Token.findOne).toHaveBeenCalledWith({ user: userId })
    expect(mockSave).toHaveBeenCalled()
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
