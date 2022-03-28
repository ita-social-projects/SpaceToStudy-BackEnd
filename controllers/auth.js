const User = require('~/models/user')
const { createToken, hashPassword, comparePasswords } = require('~/controllers/utils/auth')
const { authErr } = require('~/consts/errors')

const signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body

  try {
    const candidate = await User.findOne({ email })
    if (candidate) throw Error(authErr.ALREADY_REGISTERED)

    if (password.length < 8 || password.length > 25) throw Error(authErr.PASS_LENGTH)
    
    const hashedPassword = await hashPassword(password)
    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword })

    res.status(201).json({ user: { firstName, lastName, email, id: user._id } })
  } catch (err) {
    console.error(err)
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) throw Error(authErr.INCORRECT_CREDENTIALS)

    const auth = await comparePasswords(password, user.password)
    if (!auth) throw Error(authErr.INCORRECT_CREDENTIALS)

    const token = createToken(user._id)

    res.status(200).json({ user: { firstName: user.firstName, lastName: user.lastName, email, id: user._id } })
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  signup,
  login
}
