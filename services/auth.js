const tokenService = require('~/services/token')
const userService = require('~/services/user')
const emailService = require('~/services/email')
const { hashPassword, comparePasswords } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')
const {
  EMAIL_ALREADY_CONFIRMED,
  EMAIL_NOT_CONFIRMED,
  BAD_CONFIRM_TOKEN,
  INCORRECT_CREDENTIALS,
  EMAIL_NOT_FOUND,
  BAD_RESET_TOKEN,
  BAD_REFRESH_TOKEN
} = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')
const {
  tokenNames: { REFRESH_TOKEN, RESET_TOKEN, CONFIRM_TOKEN }
} = require('~/consts/auth')

const authService = {
  signup: async (role, firstName, lastName, email, password, language) => {
    const user = await userService.createUser(role, firstName, lastName, email, password)

    const confirmToken = tokenService.generateConfirmToken({ id: user._id })
    await tokenService.saveToken(user._id, confirmToken, CONFIRM_TOKEN)

    await emailService.sendEmail(email, emailSubject.EMAIL_CONFIRMATION, language, { confirmToken, email, firstName })

    return {
      userId: user._id,
      userEmail: user.email
    }
  },

  login: async (email, password) => {
    const user = await userService.getUserByEmail(email)

    if (!user || !(await comparePasswords(password, user.password))) {
      throw createError(401, INCORRECT_CREDENTIALS)
    }

    const { _id, role, isFirstLogin, isEmailConfirmed } = user

    if (!isEmailConfirmed) {
      throw createError(401, EMAIL_NOT_CONFIRMED)
    }

    const tokens = tokenService.generateTokens({ id: _id, role, isFirstLogin })
    await tokenService.saveToken(_id, tokens.refreshToken, REFRESH_TOKEN)

    if (isFirstLogin) {
      await userService.updateUser(_id, { isFirstLogin: false })
    }

    await userService.updateUser(_id, { lastLogin: new Date() })

    return tokens
  },

  logout: async (refreshToken) => {
    await tokenService.removeRefreshToken(refreshToken)
  },

  confirmEmail: async (confirmToken) => {
    const tokenData = tokenService.validateConfirmToken(confirmToken)
    const tokenFromDB = await tokenService.findToken(confirmToken, CONFIRM_TOKEN)

    if (!tokenFromDB || !tokenData) {
      throw createError(400, BAD_CONFIRM_TOKEN)
    }

    const { _id, isEmailConfirmed } = await userService.getUserById(tokenData.id)

    if (isEmailConfirmed) {
      throw createError(400, EMAIL_ALREADY_CONFIRMED)
    }

    await userService.updateUser(_id, { isEmailConfirmed: true })
  },

  refreshAccessToken: async (refreshToken) => {
    const tokenData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDB = tokenService.findToken(refreshToken, REFRESH_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_REFRESH_TOKEN)
    }

    const { _id, role, isFirstLogin } = await userService.getUserById(tokenData.id)

    const tokens = tokenService.generateTokens({ id: _id, role, isFirstLogin })
    await tokenService.saveToken(_id, tokens.refreshToken, REFRESH_TOKEN)

    return tokens
  },

  sendResetPasswordEmail: async (email, language) => {
    const user = await userService.getUserByEmail(email)

    if (!user) {
      throw createError(404, EMAIL_NOT_FOUND)
    }

    const { _id, firstName } = user

    const resetToken = tokenService.generateResetToken({ id: _id })
    await tokenService.saveToken(_id, resetToken, RESET_TOKEN)

    await emailService.sendEmail(email, emailSubject.RESET_PASSWORD, language, { resetToken, email, firstName })
  },

  updatePassword: async (resetToken, password) => {
    const tokenData = tokenService.validateResetToken(resetToken)
    const tokenFromDB = await tokenService.findToken(resetToken, RESET_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_RESET_TOKEN)
    }

    const { id: userId } = tokenData
    const hashedPassword = await hashPassword(password)

    await userService.updateUser(userId, { password: hashedPassword })

    await tokenService.removeResetToken(userId)
  }
}

module.exports = authService
