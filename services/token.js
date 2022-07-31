const jwt = require('jsonwebtoken')
const Token = require('~/models/token')

const tokenService = {
  generateTokens: (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
    })

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    })

    return {
      accessToken,
      refreshToken
    }
  },

  generateResetToken: (payload) => {
    const resetToken = jwt.sign(payload, process.env.JWT_RESET_SECRET, {
      expiresIn: process.env.JWT_RESET_EXPIRES_IN
    })
    return resetToken
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
    return tokenService.validateToken(token, process.env.JWT_ACCESS_SECRET)
  },

  validateRefreshToken: (token) => {
    return tokenService.validateToken(token, process.env.JWT_REFRESH_SECRET)
  },

  validateResetToken: (token) => {
    return tokenService.validateToken(token, process.env.JWT_RESET_SECRET)
  },

  saveToken: async (userId, tokenValue, tokenName) => {
    const tokenData = await Token.findOne({ user: userId })

    if (tokenData) {
      tokenData[tokenName] = tokenValue
      return tokenData.save()
    }
    const token = await Token.create({ user: userId, [tokenName]: tokenValue })

    return token
  },
  
  findToken: async (tokenValue, tokenName) => {
    const tokenData = await Token.findOne({ [tokenName]: tokenValue })

    return tokenData
  },

  removeRefreshToken: async (refreshToken) => {
    const deleteInfo = await Token.deleteOne({ refreshToken })

    return deleteInfo
  },

  removeResetToken: async (userId) => {
    await Token.updateOne(
      { user: userId },
      { $set: { resetToken: null } }
    )
  },
}

module.exports = tokenService
