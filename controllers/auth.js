const User = require('~/models/User')
const { handleErrors } = require('~/utils/errorHandler')
const { createToken } = require('~/utils/auth')

exports.postSignup = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.create({ email, password })
    const token = createToken(user._id)
    res.status(201).json({token})
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}

exports.postLogin = async (req, res) => {
  try {
    res.status(200).send('posLogin')
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}
