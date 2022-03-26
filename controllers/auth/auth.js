const User = require('~/models/User')
const { createToken, hashPassword, comparePasswords } = require('~/controllers/utils/auth')
const { ApiError } = require('~/utils/errors')
const { 
  authErr: {
    ALREADY_REGISTERED,
    PASS_LENGTH,
    INCORRECT_CREDENTIALS
  }
} = require('~/consts/errors')

const signup = async (req, res, next) => {
  const { role, firstName, lastName, email, password } = req.body

  try {
    const candidate = await User.findOne({ email })
    if (candidate) throw new ApiError (409, ALREADY_REGISTERED)

    if (password.length < 8 || password.length > 25) throw new ApiError (422, PASS_LENGTH)
    
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
    const user = await User.findOne({ email })
    if (!user) throw new ApiError (401, INCORRECT_CREDENTIALS)

    const auth = await comparePasswords(password, user.password)
    if (!auth) throw new ApiError (401, INCORRECT_CREDENTIALS)

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
