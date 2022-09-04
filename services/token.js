const jwt = require('jsonwebtoken')
const Token = require('~/models/token')
const {
  config: {
    JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    JWT_RESET_SECRET,
    JWT_RESET_EXPIRES_IN,
    JWT_CONFIRM_SECRET,
    JWT_CONFIRM_EXPIRES_IN
  }
} = require('~/configs/config')
const { tokenNames } = require('~/consts/auth')
const { createError } = require('~/utils/errorsHelper')
const { INVALID_TOKEN_NAME } = require('~/consts/errors')

const tokenService = {
  generateTokens: (payload) => {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN
    })

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    })

    return {
      accessToken,
      refreshToken
    }
  },

  generateResetToken: (payload) => {
    const resetToken = jwt.sign(payload, JWT_RESET_SECRET, {
      expiresIn: JWT_RESET_EXPIRES_IN
    })
    return resetToken
  },

  generateConfirmToken: (payload) => {
    const confirmToken = jwt.sign(payload, JWT_CONFIRM_SECRET, {
      expiresIn: JWT_CONFIRM_EXPIRES_IN
    })
    return confirmToken
  },

  validateToken: (token, secret) => {
    try {
      const data = jwt.verify(token, secret)

      return data
    } catch (e) {
      return null
    }
  },

  validateAccessToken: (token) => {
    return tokenService.validateToken(token, JWT_ACCESS_SECRET)
  },

  validateRefreshToken: (token) => {
    return tokenService.validateToken(token, JWT_REFRESH_SECRET)
  },

  validateResetToken: (token) => {
    return tokenService.validateToken(token, JWT_RESET_SECRET)
  },

  validateConfirmToken: (token) => {
    return tokenService.validateToken(token, JWT_CONFIRM_SECRET)
  },

  saveToken: async (userId, tokenValue, tokenName) => {
    if (!Object.values(tokenNames).includes(tokenName)) {
      throw createError(404, INVALID_TOKEN_NAME)
    }

    const tokenData = await Token.findOne({ user: userId })

    if (tokenData) {
      tokenData[tokenName] = tokenValue
      return tokenData.save()
    }
    const token = await Token.create({ user: userId, [tokenName]: tokenValue })

    return token
  },

  findToken: async (tokenValue, tokenName) => {
    if (!Object.values(tokenNames).includes(tokenName)) {
      throw createError(404, INVALID_TOKEN_NAME)
    }
    const tokenData = await Token.findOne({ [tokenName]: tokenValue })

    return tokenData
  },

  removeRefreshToken: async (refreshToken) => {
    const deleteInfo = await Token.deleteOne({ refreshToken })

    return deleteInfo
  },

  removeResetToken: async (userId) => {
    await Token.updateOne({ user: userId }, { $set: { resetToken: null } })
  }
}

module.exports = tokenService
