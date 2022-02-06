const User = require('~/models/User')

const handleErrors = (err) => {
  console.log(err.errors)
  let errors = { email: '', password: '' }

  if (err.code === 11000) {
    errors.email = 'SOME MESSAGE THAT HANDLES ALREADY REGISTERED EMAIL ERROR'
    return errors
  }
  if (err.message.toLowerCase().includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
  }

  return (errors)
}

exports.getSignup = async (req, res) => {
  try {
    res.send('getSignup')
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}

exports.postSignup = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.create({ email, password })
    res.status(201).json(user)
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}

exports.getLogin = async (req, res) => {
  try {
    res.send('getLogin')
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}

exports.postLogin = async (req, res) => {
  try {
    res.send('posLogin')
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}