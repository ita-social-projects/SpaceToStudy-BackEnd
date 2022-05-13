const User = require('~/models/user')
const { createToken, hashPassword, comparePasswords } = require('~/controllers/utils/auth')
const { createError } = require('~/utils/errors')
const { 
  errorCodes: {
    ALREADY_REGISTERED,
    VALIDATION_FAILED,
    INCORRECT_CREDENTIALS
  },
  errorMessages: {
    userRegistered,
    userNotRegistered,
    emailLength,
    passMismatch,
  }
} = require('~/consts/errors')

const signup = async (req, res, next) => {
  const { role, firstName, lastName, email, password } = req.body

  try {
    const candidate = await User.findOne({ email }).exec()
    if (candidate) throw createError(409, ALREADY_REGISTERED, userRegistered)

    if (password.length < 8 || password.length > 25) throw createError(422, VALIDATION_FAILED, emailLength)
    
    const hashedPassword = await hashPassword(password)
    const user = await User.create({ role, firstName, lastName, email, password: hashedPassword })

    res.status(201).json({ user: { firstName, lastName, email, id: user._id } })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).exec()
    if (!user) throw createError(401, INCORRECT_CREDENTIALS, userNotRegistered)

    const auth = await comparePasswords(password, user.password)
    if (!auth) throw createError(401, INCORRECT_CREDENTIALS, passMismatch)

    const token = createToken(user._id)

    res.status(200).json({ user: { firstName: user.firstName, lastName: user.lastName, email, id: user._id } })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  signup,
  login
}
