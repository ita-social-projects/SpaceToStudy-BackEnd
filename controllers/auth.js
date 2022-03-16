const User = require('~/models/User')
const { handleErrors } = require('~/utils/errorHandler')
const { createToken, hashPassword, comparePasswords } = require('~/controllers/utils/auth')
const { authErr } = require('~/consts/errors')

exports.signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body
  
  try {
    if (password.length < 8 || password.length > 25) throw Error(authErr.PASS_LENGTH)
    const hashedPassword = await hashPassword(password)
    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword })

    res.status(201).json({ user: { firstName, lastName, email, id: user._id } })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(401).json({ errors }) // 422 Unprocessable Entity
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) throw Error(authErr.INCORRECT_CREDENTIALS)

    const auth = await comparePasswords(password, user.password)
    if (!auth) throw Error(authErr.INCORRECT_CREDENTIALS)

    const token = createToken(user._id)

    res.status(200).json({ user: { firstName: user.firstName, lastName: user.lastName, email, id: user._id } })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(401).json({errors})
  }
}
