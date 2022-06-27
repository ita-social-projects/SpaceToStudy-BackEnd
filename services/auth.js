const { v4: uuidv4 } = require('uuid')

const User = require('~/models/user')
const tokenService = require('~/services/token')
const { hashPassword, comparePasswords } = require('~/utils/passwordHelper')
const { createError, createUnauthorizedError } = require('~/utils/errorsHelper')
const {
  errorCodes: { ALREADY_REGISTERED, VALIDATION_FAILED, INCORRECT_CREDENTIALS, BAD_REQUEST },
  errorMessages: { userRegistered, userNotRegistered, emailLength, passMismatch, badActivationLink }
} = require('~/consts/errors')

const authService = {
  signup: async (role, firstName, lastName, email, password) => {
    const candidate = await User.findOne({ email }).exec()

    if (candidate) {
      throw createError(409, ALREADY_REGISTERED, userRegistered)
    }

    if (password.length < 8 || password.length > 25) {
      throw createError(422, VALIDATION_FAILED, emailLength)
    }

    const hashedPassword = await hashPassword(password)
    const activationLink = uuidv4()

    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword, activationLink })

    //TODO
    //await mailService.sendActivationMail(email, `${process.env.SERVER_URL}/api/activate/${activationLink}`)

    return {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user._id
      }
    }
  },

  login: async (email, password) => {
    const user = await User.findOne({ email }).exec()

    if (!user) {
      throw createError(401, INCORRECT_CREDENTIALS, userNotRegistered)
    }

    const isPassEquals = await comparePasswords(password, user.password)

    if (!isPassEquals) {
      throw createError(401, INCORRECT_CREDENTIALS, passMismatch)
    }

    const tokens = tokenService.generateTokens({ id: user._id, role: user.role })
    await tokenService.saveToken(user._id, tokens.refreshToken)

    return {
      ...tokens,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user._id
      }
    }
  },

  logout: async (refreshToken) => {
    const deleteInfo = await tokenService.removeToken(refreshToken)

    return deleteInfo
  },

  activate: async (activationLink) => {
    const user = await User.findOne({ activationLink })
    if (!user) {
      throw createError(400, BAD_REQUEST, badActivationLink)
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

    return {
      ...tokens,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user._id
      }
    }
  }
}

module.exports = authService
