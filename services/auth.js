const { v4: uuidv4 } = require('uuid')

const User = require('~/models/user')
const tokenService = require('~/services/token')
const { hashPassword, comparePasswords, isPasswordValid } = require('~/utils/passwordHelper')
const { createError, createUnauthorizedError } = require('~/utils/errorsHelper')
const {
  ALREADY_REGISTERED,
  BAD_ACTIVATION_LINK,
  INCORRECT_CREDENTIALS,
  USER_NOT_REGISTERED,
  PASSWORD_LENGTH_VALIDATION_FAILED,
  EMAIL_NOT_FOUND,
  BAD_RESET_TOKEN
} = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')
const { sendEmail } = require('~/utils/emailService')
const { tokenNames: { REFRESH_TOKEN, RESET_TOKEN } } = require('~/consts/auth')

const authService = {
  signup: async (role, firstName, lastName, email, password) => {
    const candidate = await User.findOne({ email }).exec()

    if (candidate) {
      throw createError(409, ALREADY_REGISTERED)
    }

    if (!isPasswordValid(password)) {
      throw createError(422, PASSWORD_LENGTH_VALIDATION_FAILED)
    }

    const hashedPassword = await hashPassword(password)
    const activationLink = uuidv4()

    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword, activationLink })

    await sendEmail(email, emailSubject.EMAIL_CONFIRMATION, { activationLink, email, firstName })

    return {
      userEmail: user.email
    }
  },

  login: async (email, password) => {
    const user = await User.findOne({ email }).exec()

    if (!user) {
      throw createError(401, USER_NOT_REGISTERED)
    }

    const isPassEquals = await comparePasswords(password, user.password)

    if (!isPassEquals) {
      throw createError(401, INCORRECT_CREDENTIALS)
    }

    const tokens = tokenService.generateTokens({ id: user._id, role: user.role })
    await tokenService.saveToken(user._id, tokens.refreshToken, REFRESH_TOKEN)

    return tokens
  },

  logout: async (refreshToken) => {
    const deleteInfo = await tokenService.removeRefreshToken(refreshToken)

    return deleteInfo
  },

  activate: async (activationLink) => {
    const user = await User.findOne({ activationLink })
    if (!user) {
      throw createError(400, BAD_ACTIVATION_LINK)
    }
    user.isActivated = true
    await user.save()
  },

  refresh: async (refreshToken) => {
    if (!refreshToken) {
      throw createUnauthorizedError()
    }

    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = tokenService.findToken(refreshToken, REFRESH_TOKEN)

    if (!userData || !tokenFromDb) {
      throw createUnauthorizedError()
    }

    const user = await User.findById(userData.id)

    const tokens = tokenService.generateTokens({ id: user._id, role: user.role })
    await tokenService.saveToken(user._id, tokens.refreshToken, REFRESH_TOKEN)

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

    await sendEmail(email, emailSubject.RESET_PASSWORD, { resetToken, email, firstName })

    return resetToken
  },

  updatePassword: async (resetToken, password) => {
    const tokenData = tokenService.validateResetToken(resetToken)
    const tokenFromDB = await tokenService.findToken(resetToken, RESET_TOKEN)
    
    if (!tokenData || !tokenFromDB) {
      throw createError(401, BAD_RESET_TOKEN)
    }

    if (!isPasswordValid(password)) {
      throw createError(422, PASSWORD_LENGTH_VALIDATION_FAILED)
    }

    const { id: userId } = tokenData
    const hashedPassword = await hashPassword(password)

    await User.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } },
    ).exec()
    
    await tokenService.removeResetToken(userId)
  },
}

module.exports = authService
