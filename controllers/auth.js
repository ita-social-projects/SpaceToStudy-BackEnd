const bcrypt = require('bcrypt')

const User = require('~/models/User')
const { handleErrors } = require('~/utils/errorHandler')
const { createToken } = require('~/utils/auth')
const { errorMessages } = require('~/consts/auth')

exports.signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword })
    // here will be logic for sending confirmation email
    res.status(201).json({ user: { firstName, lastName, email, id: user._id } })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) throw Error(errorMessages.INCORRECT_CREDENTIALS)

    const auth = await bcrypt.compare(password, user.password)
    if (!auth) throw Error(errorMessages.INCORRECT_CREDENTIALS)

    const token = createToken(user._id)
    // what should we do with token?
    res.status(200).json({ user: { firstName: user.firstName, lastName: user.lastName, email, id: user._id } })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}
