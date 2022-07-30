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
  EMAIL_NOT_FOUND
} = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')
const { sendEmail } = require('~/utils/emailService')

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
    await tokenService.saveToken(user._id, tokens.refreshToken)

    return tokens
  },

  logout: async (refreshToken) => {
    const deleteInfo = await tokenService.removeToken(refreshToken)

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
    const tokenFromDb = tokenService.findToken(refreshToken)

    if (!userData || !tokenFromDb) {
      throw createUnauthorizedError()
    }

    const user = await User.findById(userData.id)

    const tokens = tokenService.generateTokens({ id: user._id, role: user.role })
    await tokenService.saveToken(user._id, tokens.refreshToken)

    return tokens
  },

  sendResetPasswordEmail: async (email, refreshToken) => {
    const user = await User.findOne({ email }).exec()
    if (!user) {
      throw createError(404, EMAIL_NOT_FOUND)
    }

    if (!refreshToken) {
      throw createUnauthorizedError()
    }

    const resetLink = new URL(`${process.env.CLIENT_URL}/reset-password`)
    resetLink.searchParams.append('token', refreshToken)

    await sendEmail(email, emailSubject.RESET_PASSWORD, { resetLink })
  },

  updatePassword: async (refreshToken, password) => {
    const tokenData = await tokenService.findToken(refreshToken)
    if (!tokenData) {
      throw createUnauthorizedError()
    }

    if (!isPasswordValid(password)) {
      throw createError(422, PASSWORD_LENGTH_VALIDATION_FAILED)
    }

    const { user: userId } = tokenData
    const hashedPassword = await hashPassword(password)

    await User.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } },
    ).exec()
    
    return { userId }
  },
}

module.exports = authService
