require('~/initialization/envSetup')
const jwt = require('jsonwebtoken')
const Token = require('~/models/token')
const tokenService = require('~/services/token')
const { createError } = require('~/utils/errorsHelper')
const {
  tokenNames: { RESET_TOKEN }
} = require('~/consts/auth')
const { INVALID_TOKEN_NAME } = require('~/consts/errors')

jest.mock('~/configs/config', () => ({
  config: {
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_ACCESS_EXPIRES_IN: '1h',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_REFRESH_EXPIRES_IN: '7d',
    JWT_REFRESH_LONG_TERM_EXPIRES_IN: '10d',
    JWT_RESET_SECRET: 'reset-secret',
    JWT_RESET_EXPIRES_IN: '1h',
    JWT_CONFIRM_SECRET: 'confirm-secret',
    JWT_CONFIRM_EXPIRES_IN: '1h'
  }
}))

jest.mock('~/models/token', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
  updateOne: jest.fn()
}))

describe('Token service', () => {
  const data = { id: 'testExample' }
  const tokenValue = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ8'
  const userId = '631f8e5e587794b884b75483'

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('Should validate access token', () => {
    const { accessToken } = tokenService.generateTokens(data)
    const testData = tokenService.validateAccessToken(accessToken)

    expect(testData).toEqual(expect.objectContaining(data))
  })

  it('Should validate refresh token', () => {
    const { refreshToken } = tokenService.generateTokens(data)
    const testData = tokenService.validateRefreshToken(refreshToken)

    expect(testData).toEqual(expect.objectContaining(data))
  })

  it('Should generate a reset token', () => {
    const resetToken = tokenService.generateResetToken(data)
    const testData = tokenService.validateResetToken(resetToken)

    expect(testData).toEqual(expect.objectContaining(data))
  })

  it('Should generate a confirm token', () => {
    const confirmToken = tokenService.generateConfirmToken(data)
    const testData = tokenService.validateConfirmToken(confirmToken)

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

  it('Should create and save a new token if one does not exist', async () => {
    const mockFindOne = jest.fn().mockResolvedValue(null)
    const mockCreate = jest.fn().mockResolvedValue({ user: userId, resetToken: tokenValue })

    Token.findOne = mockFindOne
    Token.create = mockCreate

    const result = await tokenService.saveToken(userId, tokenValue, RESET_TOKEN)

    expect(mockFindOne).toHaveBeenCalledWith({ user: userId })
    expect(mockCreate).toHaveBeenCalledWith({ user: userId, resetToken: tokenValue })
    expect(result).toEqual({ user: userId, resetToken: tokenValue })
  })

  it('Should return null for an invalid token', () => {
    const token = 'invalid-token'
    const result = tokenService.validateToken(token)

    expect(result).toBeNull()
  })

  it('Should return null if an error occurs', async () => {
    const mockFind = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Database error'))
    })

    Token.find = mockFind

    const result = await tokenService.findToken(tokenValue, RESET_TOKEN)

    expect(mockFind).toHaveBeenCalledWith({ resetToken: tokenValue })
    expect(result).toBeNull()
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

  it('Should find a token by value and name', async () => {
    const tokenData = { user: userId, resetToken: tokenValue }
    const mockFind = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([tokenData])
    })

    Token.find = mockFind

    const result = await tokenService.findToken(tokenValue, RESET_TOKEN)

    expect(mockFind).toHaveBeenCalledWith({ resetToken: tokenValue })
    expect(result).toEqual(tokenData)
    mockFind.mockRestore()
  })

  it('Should find tokens with users by params', async () => {
    const params = { resetToken: tokenValue }
    const mockFind = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ user: userId, resetToken: tokenValue }])
        })
      })
    })

    Token.find = mockFind

    const result = await tokenService.findTokensWithUsersByParams(params)

    expect(mockFind).toHaveBeenCalledWith(params)
    expect(result).toEqual([{ user: userId, resetToken: tokenValue }])

    mockFind.mockRestore()
  })

  it('Should generate refresh token with long term expiration when rememberMe is true', () => {
    const payload = { id: 'testExample', rememberMe: true }

    const { refreshToken } = tokenService.generateTokens(payload)

    const decoded = jwt.decode(refreshToken)

    expect(decoded.exp).toBe(10 * 24 * 60 * 60 + Math.floor(Date.now() / 1000))
  })

  it('Should generate refresh token with short term expiration when rememberMe is false', () => {
    const payload = { id: 'testExample', rememberMe: false }
    const { refreshToken } = tokenService.generateTokens(payload)

    const decoded = jwt.decode(refreshToken)

    expect(decoded.exp).toBe(7 * 24 * 60 * 60 + Math.floor(Date.now() / 1000))
  })

  it('Should remove refresh token', async () => {
    const mockDeleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 })
    Token.deleteOne = mockDeleteOne

    await tokenService.removeRefreshToken(tokenValue)

    expect(mockDeleteOne).toHaveBeenCalledWith({ refreshToken: tokenValue })
  })

  it('Should remove reset token', async () => {
    const mockUpdateOne = jest.fn().mockResolvedValue({ nModified: 1 })
    Token.updateOne = mockUpdateOne

    await tokenService.removeResetToken(userId)

    expect(mockUpdateOne).toHaveBeenCalledWith({ user: userId }, { $set: { resetToken: null } })
  })

  it('Should remove confirm token', async () => {
    const mockDeleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 })
    Token.deleteOne = mockDeleteOne

    await tokenService.removeConfirmToken(tokenValue)

    expect(mockDeleteOne).toHaveBeenCalledWith({ confirmToken: tokenValue })
  })
})
