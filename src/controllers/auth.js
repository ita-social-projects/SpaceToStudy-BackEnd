const authService = require('~/services/auth')
const { createForbiddenError } = require('~/utils/errorsHelper')
const { oneDayInMs, thirtyDaysInMs } = require('~/consts/auth')
const {
  config: { COOKIE_DOMAIN }
} = require('~/configs/config')
const {
  tokenNames: { REFRESH_TOKEN, ACCESS_TOKEN }
} = require('~/consts/auth')

const COOKIE_OPTIONS = {
  maxAge: oneDayInMs,
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: COOKIE_DOMAIN
}

const signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body
  const lang = req.lang

  const userData = await authService.signup(role, firstName, lastName, email, password, lang)

  res.status(201).json(userData)
}

const login = async (req, res) => {
  const { email, password, rememberMe } = req.body

  const tokens = await authService.login(email, password, { rememberMe })

  const refreshTokenCookieOptions = {
    ...COOKIE_OPTIONS,
    maxAge: rememberMe ? thirtyDaysInMs : oneDayInMs
  }

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, refreshTokenCookieOptions)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const googleAuth = async (req, res) => {
  const { token, role } = req.body
  const lang = req.lang

  const tokens = await authService.googleAuth(token.credential, role, lang)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  await authService.logout(refreshToken)

  res.clearCookie(REFRESH_TOKEN)
  res.clearCookie(ACCESS_TOKEN)

  res.status(204).end()
}

const confirmEmail = async (req, res) => {
  const confirmToken = req.params.token

  await authService.confirmEmail(confirmToken)

  res.status(204).end()
}

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    res.clearCookie(ACCESS_TOKEN)

    return res.status(401).end()
  }

  const tokens = await authService.refreshAccessToken(refreshToken)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body
  const lang = req.lang

  await authService.sendResetPasswordEmail(email, lang)

  res.status(204).end()
}

const updatePassword = async (req, res) => {
  const { password } = req.body
  const resetToken = req.params.token
  const lang = req.lang

  await authService.updatePassword(resetToken, password, lang)

  res.status(204).end()
}

const changePassword = async (req, res) => {
  const { id } = req.params
  const { currentPassword, password } = req.body

  if (id !== req.user.id) throw createForbiddenError()
  await authService.changePassword(id, { currentPassword, password })

  res.status(204).end()
}

module.exports = {
  signup,
  login,
  googleAuth,
  logout,
  confirmEmail,
  refreshAccessToken,
  sendResetPasswordEmail,
  updatePassword,
  changePassword
}
