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

  validateAccessToken: (token) => {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

      return userData
    } catch (e) {
      return null
    }
  },

  validateRefreshToken: (token) => {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

      return userData
    } catch (e) {
      return null
    }
  },

  saveToken: async (userId, refreshToken) => {
    const tokenData = await Token.findOne({ user: userId })

    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return tokenData.save()
    }
    const token = await Token.create({ user: userId, refreshToken })

    return token
  },

  removeToken: async (refreshToken) => {
    const deleteInfo = await Token.deleteOne({ refreshToken })

    return deleteInfo
  },

  findToken: async (refreshToken) => {
    const tokenData = await Token.findOne({ refreshToken })

    return tokenData
  }
}

module.exports = tokenService
