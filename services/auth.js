const User = require('~/models/user')
const Role = require('~/models/role')
const tokenService = require('~/services/token')
const userService = require('~/services/user')
const emailService = require('~/services/email')
const { hashPassword, comparePasswords } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')
const {
  ALREADY_REGISTERED,
  EMAIL_ALREADY_CONFIRMED,
  EMAIL_NOT_CONFIRMED,
  BAD_CONFIRM_TOKEN,
  INCORRECT_CREDENTIALS,
  USER_NOT_REGISTERED,
  EMAIL_NOT_FOUND,
  BAD_RESET_TOKEN,
  BAD_REFRESH_TOKEN
} = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')
const {
  tokenNames: { REFRESH_TOKEN, RESET_TOKEN, CONFIRM_TOKEN }
} = require('~/consts/auth')

const authService = {
  signup: async (role, firstName, lastName, email, password) => {
    const candidate = await User.findOne({ email }).exec()

    if (candidate) {
      throw createError(409, ALREADY_REGISTERED)
    }

    const hashedPassword = await hashPassword(password)
    const foundRole = await Role.findOne({ value: role }).exec()

    const user = await User.create({
      role: foundRole,
      firstName,
      lastName,
      email,
      password: hashedPassword
    })

    const confirmToken = tokenService.generateConfirmToken({ id: user._id })
    await tokenService.saveToken(user._id, confirmToken, CONFIRM_TOKEN)

    await emailService.sendEmail(email, emailSubject.EMAIL_CONFIRMATION, { confirmToken, email, firstName })

    return {
      userId: user._id,
      userEmail: user.email
    }
  },

  login: async (email, password) => {
    const user = await User.findOne({ email }).populate('role').exec()

    if (!user) {
      throw createError(401, USER_NOT_REGISTERED)
    }

    const isPassEquals = await comparePasswords(password, user.password)

    if (!isPassEquals) {
      throw createError(401, INCORRECT_CREDENTIALS)
    }

    if (!user.isEmailConfirmed) {
      throw createError(401, EMAIL_NOT_CONFIRMED)
    }

    const tokens = tokenService.generateTokens({ id: user._id, role: user.role.value, isFirstLogin: user.isFirstLogin })
    await tokenService.saveToken(user._id, tokens.refreshToken, REFRESH_TOKEN)

    if (user.isFirstLogin) {
      await User.updateOne({ _id: user._id }, { $set: { isFirstLogin: false } }).exec()
    }

    user.lastLogin = new Date()
    await user.save()

    return tokens
  },

  logout: async (refreshToken) => {
    const deleteInfo = await tokenService.removeRefreshToken(refreshToken)

    return deleteInfo
  },

  confirmEmail: async (confirmToken) => {
    const tokenData = tokenService.validateConfirmToken(confirmToken)
    const tokenFromDB = await tokenService.findToken(confirmToken, CONFIRM_TOKEN)

    if (!tokenFromDB || !tokenData) {
      throw createError(400, BAD_CONFIRM_TOKEN)
    }

    const { id: userId } = tokenData
    const user = await userService.getUser(userId)

    if (user.isEmailConfirmed) {
      throw createError(400, EMAIL_ALREADY_CONFIRMED)
    }

    await User.updateOne({ _id: userId }, { $set: { isEmailConfirmed: true } }).exec()
  },

  refreshAccessToken: async (refreshToken) => {
    const tokenData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDB = tokenService.findToken(refreshToken, REFRESH_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_REFRESH_TOKEN)
    }

    const { id, role, isFirstLogin } = await userService.getUser(tokenData.id)

    const tokens = tokenService.generateTokens({ id, role, isFirstLogin })
    await tokenService.saveToken(id, tokens.refreshToken, REFRESH_TOKEN)

    return tokens
  },

  sendResetPasswordEmail: async (email) => {
    const user = await User.findOne({ email }).exec()
    if (!user) {
      throw createError(404, EMAIL_NOT_FOUND)
    }

    const resetToken = tokenService.generateResetToken({ id: user._id })
    await tokenService.saveToken(user._id, resetToken, RESET_TOKEN)

    const { firstName } = user

    await emailService.sendEmail(email, emailSubject.RESET_PASSWORD, { resetToken, email, firstName })
  },

  updatePassword: async (resetToken, password) => {
    const tokenData = tokenService.validateResetToken(resetToken)
    const tokenFromDB = await tokenService.findToken(resetToken, RESET_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_RESET_TOKEN)
    }

    const { id: userId } = tokenData
    const hashedPassword = await hashPassword(password)

    await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } }).exec()

    await tokenService.removeResetToken(userId)
  }
}

module.exports = authService
