const { OAuth2Client } = require('google-auth-library')
const tokenService = require('~/services/token')
const emailService = require('~/services/email')
const { getUserByEmail, createUser, privateUpdateUser, getUserById } = require('~/services/user')
const { hashPassword, comparePasswords } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')
const {
  EMAIL_ALREADY_CONFIRMED,
  EMAIL_NOT_CONFIRMED,
  BAD_CONFIRM_TOKEN,
  INCORRECT_CREDENTIALS,
  BAD_RESET_TOKEN,
  BAD_REFRESH_TOKEN,
  USER_NOT_FOUND
} = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')
const {
  tokenNames: { REFRESH_TOKEN, RESET_TOKEN, CONFIRM_TOKEN }
} = require('~/consts/auth')
const {
  gmailCredentials: { clientId }
} = require('~/configs/config')

const authService = {
  signup: async (role, firstName, lastName, email, password, language) => {
    const user = await createUser(role, firstName, lastName, email, password, language)

    const confirmToken = tokenService.generateConfirmToken({ id: user._id, role })
    await tokenService.saveToken(user._id, confirmToken, CONFIRM_TOKEN)
    await emailService.sendEmail(email, emailSubject.EMAIL_CONFIRMATION, language, { confirmToken, email, firstName })
    return {
      userId: user._id,
      userEmail: user.email
    }
  },

  googleAuth: async (idToken, role, language) => {
    const client = new OAuth2Client(clientId)
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId
    })
    const payload = ticket.getPayload()

    if (role) {
      const user = await getUserByEmail(payload.email)
      if (!user) {
        const isEmailConfirmed = true
        await createUser(
          role,
          payload.given_name,
          payload.family_name,
          payload.email,
          payload.sub,
          language,
          isEmailConfirmed
        )
      }
    }
    const isFromGoogle = true

    return await module.exports.login(payload.email, payload.sub, isFromGoogle)
  },

  login: async (email, password, isFromGoogle) => {
    const user = await getUserByEmail(email)

    if (!user) {
      throw createError(401, USER_NOT_FOUND)
    }

    const checkedPassword = (await comparePasswords(password, user.password)) || isFromGoogle

    if (!checkedPassword) {
      throw createError(401, INCORRECT_CREDENTIALS)
    }

    const { _id, lastLoginAs, isFirstLogin, isEmailConfirmed } = user

    if (!isEmailConfirmed) {
      throw createError(401, EMAIL_NOT_CONFIRMED)
    }

    const tokens = tokenService.generateTokens({ id: _id, role: lastLoginAs, isFirstLogin })
    await tokenService.saveToken(_id, tokens.refreshToken, REFRESH_TOKEN)

    if (isFirstLogin) {
      await privateUpdateUser(_id, { isFirstLogin: false })
    }

    await privateUpdateUser(_id, { lastLogin: new Date() })

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

    const { _id, isEmailConfirmed } = await getUserById(tokenData.id)

    if (isEmailConfirmed) {
      throw createError(400, EMAIL_ALREADY_CONFIRMED)
    }

    await privateUpdateUser(_id, { isEmailConfirmed: true })
  },

  refreshAccessToken: async (refreshToken) => {
    const tokenData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDB = tokenService.findToken(refreshToken, REFRESH_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_REFRESH_TOKEN)
    }

    const { _id, lastLoginAs, isFirstLogin } = await getUserById(tokenData.id)

    const tokens = tokenService.generateTokens({ id: _id, role: lastLoginAs, isFirstLogin })
    await tokenService.saveToken(_id, tokens.refreshToken, REFRESH_TOKEN)

    return tokens
  },

  sendResetPasswordEmail: async (email, language) => {
    const user = await getUserByEmail(email)

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }

    const { _id, firstName } = user

    const resetToken = tokenService.generateResetToken({ id: _id, firstName, email })
    await tokenService.saveToken(_id, resetToken, RESET_TOKEN)

    await emailService.sendEmail(email, emailSubject.RESET_PASSWORD, language, { resetToken, email, firstName })
  },

  updatePassword: async (resetToken, password, language) => {
    const tokenData = tokenService.validateResetToken(resetToken)
    const tokenFromDB = await tokenService.findToken(resetToken, RESET_TOKEN)

    if (!tokenData || !tokenFromDB) {
      throw createError(400, BAD_RESET_TOKEN)
    }

    const { id: userId, firstName, email } = tokenData
    const hashedPassword = await hashPassword(password)
    await privateUpdateUser(userId, { password: hashedPassword })

    await tokenService.removeResetToken(userId)

    await emailService.sendEmail(email, emailSubject.SUCCESSFUL_PASSWORD_RESET, language, {
      firstName
    })
  }
}

module.exports = authService
