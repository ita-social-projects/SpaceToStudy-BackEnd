const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_REGISTERED } = require('~/consts/errors')

const userService = {
  getUsers: async () => {
    const users = await User.find().populate('role').lean().exec()

    return users.map(({ _id, firstName, lastName, role, email }) => ({
      id: _id,
      firstName,
      lastName,
      role: role.value,
      email
    }))
  },

  getUser: async (userId) => {
    const user = await User.findById(userId).populate('role').lean().exec()

    if (!user) throw createError(404, USER_NOT_REGISTERED)

    const { _id: id, firstName, lastName, role, email } = user
    return { id, firstName, lastName, role: role.value, email }
  },

  deleteUser: async (userId) => {
    const user = await User.findById(userId).exec()

    if (!user) throw createError(404, USER_NOT_REGISTERED)

    await User.findByIdAndRemove(userId).exec()
  }
}

module.exports = userService
