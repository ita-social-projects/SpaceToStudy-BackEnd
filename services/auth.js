const { v4: uuidv4 } = require('uuid')

const User = require('~/models/user')
const tokenService = require('~/services/token')
const { hashPassword, comparePasswords } = require('~/utils/passwordHelper')
const { createError, createUnauthorizedError } = require('~/utils/errorsHelper')
const {
  ALREADY_REGISTERED,
  BAD_ACTIVATION_LINK,
  INCORRECT_CREDENTIALS,
  USER_NOT_REGISTERED,
  PASSWORD_LENGTH_VALIDATION_FAILED
} = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')
const { sendMail } = require('~/utils/emailService')

const authService = {
  signup: async (role, firstName, lastName, email, password) => {
    const candidate = await User.findOne({ email }).exec()

    if (candidate) {
      throw createError(409, ALREADY_REGISTERED)
    }

    if (password.length < 8 || password.length > 25) {
      throw createError(422, PASSWORD_LENGTH_VALIDATION_FAILED)
    }

    const hashedPassword = await hashPassword(password)
    const activationLink = uuidv4()

    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword, activationLink })

    //TODO
    //await mailService.sendActivationMail(email, `${process.env.SERVER_URL}/api/activate/${activationLink}`)
    await sendMail(email, emailSubject.EMAIL_CONFIRMATION, { activationLink })

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
  }
}

module.exports = authService
