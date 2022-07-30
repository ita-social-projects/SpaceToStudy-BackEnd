const authService = require('~/services/auth')
const { oneDayInMs } = require('~/consts/auth')

const signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body

  const userData = await authService.signup(role, firstName, lastName, email, password)

  res.status(201).json(userData)
}

const login = async (req, res) => {
  const { email, password } = req.body

  const tokens = await authService.login(email, password)

  res.cookie('refreshToken', tokens.refreshToken, {
    maxAge: oneDayInMs,
    httpOnly: true
  })

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  const logoutInfo = await authService.logout(refreshToken)
  res.clearCookie('refreshToken')

  res.status(200).json(logoutInfo)
}

const activate = async (req, res) => {
  const activationLink = req.params.link
  await authService.activate(activationLink)

  res.redirect(process.env.CLIENT_URL)
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies

  const tokens = await authService.refresh(refreshToken)
  res.cookie('refreshToken', tokens.refreshToken, {
    maxAge: oneDayInMs,
    httpOnly: true
  })

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  const { refreshToken } = req.cookies

  await authService.sendResetPasswordEmail(email, refreshToken)

  res.status(200).json({ email });
}

const updatePassword = async (req, res) => {
  const { password } = req.body
  const { refreshToken } = req.cookies

  const user = await authService.updatePassword(refreshToken, password)

  res.status(200).json(user)
}

module.exports = {
  signup,
  login,
  logout,
  activate,
  refresh,
  sendResetPasswordEmail,
  updatePassword,
}
