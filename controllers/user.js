const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_REGISTERED } = require('~/consts/errors')

const getUsers = async (_req, res) => {
  const users = await User.find().lean()

  const usersResponse = users.map((user) => {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email
    }
  })

  res.status(200).json({
    users: usersResponse
  })
}

const getUser = async (req, res) => {
  const userId = req.params.userId

  const user = await User.findById(userId).lean()

  if (!user) throw createError(404, USER_NOT_REGISTERED)

  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email
  }

  res.status(200).json({
    user: userResponse
  })
}

const deleteUser = async (req, res) => {
  const userId = req.params.userId
  const user = await User.findById(userId)

  if (!user) throw createError(404, USER_NOT_REGISTERED)

  await User.findByIdAndRemove(userId)

  res.status(200).json({ message: 'User deleted.' })
}

module.exports = {
  getUsers,
  getUser,
  deleteUser
}
