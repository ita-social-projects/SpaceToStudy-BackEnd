const authService = require('~/services/auth')
const { oneDayInMs } = require('~/consts/auth')

const signup = async (req, res, next) => {
  try {
    const { role, firstName, lastName, email, password } = req.body

    const userData = await authService.signup(role, firstName, lastName, email, password)

    res.status(201).json(userData)
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const userData = await authService.login(email, password)

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: oneDayInMs,
      httpOnly: true
    })

    delete userData.refreshToken

    res.status(200).json(userData)
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies

    const token = await authService.logout(refreshToken)
    res.clearCookie('refreshToken')

    res.status(200).json(token)
  } catch (err) {
    next(err)
  }
}

const activate = async (req, res, next) => {
  try {
    const activationLink = req.params.link
    await authService.activate(activationLink)

    res.redirect(process.env.CLIENT_URL)
  } catch (err) {
    next(err)
  }
}

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies

    const userData = await authService.refresh(refreshToken)
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: oneDayInMs,
      httpOnly: true
    })

    delete userData.refreshToken

    res.status(200).json(userData)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  signup,
  login,
  logout,
  activate,
  refresh
}
