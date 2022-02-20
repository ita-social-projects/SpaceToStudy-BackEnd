const User = require('~/models/User')
const { handleErrors } = require('~/utils/errorHandler')
const bcrypt = require('bcrypt')

// const { createToken } = require('~/utils/auth')

exports.signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword })
    res.status(201).json({ user: { firstName, lastName, email, id: user._id } })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }

}

exports.login = async (req, res) => {
  try {
    res.status(200).send('posLogin')
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}
