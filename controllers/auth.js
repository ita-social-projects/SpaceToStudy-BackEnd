const authService = require('~/services/auth')
const { oneDayInMs } = require('~/consts/auth')
const {
  config: { COOKIE_DOMAIN }
} = require('~/configs/config')
const {
  tokenNames: { REFRESH_TOKEN }
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

  const userData = await authService.signup(role, firstName, lastName, email, password)

  res.status(201).json(userData)
}

const login = async (req, res) => {
  const { email, password } = req.body

  const tokens = await authService.login(email, password)

  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  const logoutInfo = await authService.logout(refreshToken)
  res.clearCookie(REFRESH_TOKEN)

  res.status(200).json(logoutInfo)
}

const confirmEmail = async (req, res) => {
  const confirmToken = req.params.token

  await authService.confirmEmail(confirmToken)

  res.status(204).end()
}

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies

  const tokens = await authService.refreshAccessToken(refreshToken)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body

  await authService.sendResetPasswordEmail(email)

  res.status(204).end()
}

const updatePassword = async (req, res) => {
  const { password, resetToken } = req.body

  await authService.updatePassword(resetToken, password)

  res.status(204).end()
}

module.exports = {
  signup,
  login,
  logout,
  confirmEmail,
  refreshAccessToken,
  sendResetPasswordEmail,
  updatePassword
}
