const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_REGISTERED } = require('~/consts/errors')

const userService = {
  getUsers: async () => {
    const users = await User.find().populate('role').lean().exec()

    return users.map((user) => {
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.value,
        email: user.email
      }
    })
  },

  getUser: async (userId) => {
    const user = await User.findById(userId).populate('role').lean().exec()

    if (!user) throw createError(404, USER_NOT_REGISTERED)

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.value,
      email: user.email
    }
  },

  deleteUser: async (userId) => {
    const user = await User.findById(userId).exec()

    if (!user) throw createError(404, USER_NOT_REGISTERED)

    await User.findByIdAndRemove(userId).exec()
  }
}

module.exports = userService