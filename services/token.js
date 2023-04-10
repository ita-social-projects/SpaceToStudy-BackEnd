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
const { INVALID_TOKEN_NAME } = require('~/consts/errors')
const { tokenNames } = require('~/consts/auth')
const { createError } = require('~/utils/errorsHelper')

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
    return jwt.sign(payload, JWT_RESET_SECRET, {
      expiresIn: JWT_RESET_EXPIRES_IN
    })
  },

  generateConfirmToken: (payload) => {
    return jwt.sign(payload, JWT_CONFIRM_SECRET, {
      expiresIn: JWT_CONFIRM_EXPIRES_IN
    })
  },

  validateToken: (token, secret) => {
    try {
      return jwt.verify(token, secret)
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

    return await Token.create({ user: userId, [tokenName]: tokenValue })
  },

  findToken: async (tokenValue, tokenName) => {
    if (!Object.values(tokenNames).includes(tokenName)) {
      throw createError(404, INVALID_TOKEN_NAME)
    }

    return await Token.findOne({ [tokenName]: tokenValue })
  },

  findTokensWithUsersByParams: async (params) => {
    return Token.find(params).populate('user').lean().exec()
  },

  removeRefreshToken: async (refreshToken) => {
    await Token.deleteOne({ refreshToken })
  },

  removeResetToken: async (userId) => {
    await Token.updateOne({ user: userId }, { $set: { resetToken: null } })
  },

  removeConfirmToken: async (confirmToken) => {
    await Token.deleteOne({ confirmToken })
  }
}

module.exports = tokenService
