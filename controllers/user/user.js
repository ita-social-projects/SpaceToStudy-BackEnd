const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')

const {
  errorCodes: { NOT_FOUND },
  errorMessages: { userNotRegistered }
} = require('~/consts/errors')

const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('firstName lastName role email').lean()

    res.status(200).json({
      users
    })
  } catch (err) {
    next(err)
  }
}

const getUser = async (req, res, next) => {
  const userId = req.params.userId

  try {
    const user = await User.findById(userId).select('firstName lastName role email').lean()

    if (!user) throw createError(404, NOT_FOUND, userNotRegistered)

    res.status(200).json({
      user
    })
  } catch (err) {
    next(err)
  }
}

const deleteUser = async (req, res, next) => {
  const userId = req.params.userId
  try {
    const user = await User.findById(userId)

    if (!user) throw createError(404, NOT_FOUND, userNotRegistered)

    await User.findByIdAndRemove(userId)

    res.status(200).json({ message: 'User deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getUsers,
  getUser,
  deleteUser
}
