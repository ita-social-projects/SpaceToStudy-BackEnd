const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_FOUND } = require('~/consts/errors')

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

  getUserById: async (userId) => {
    const user = await User.findById(userId).populate('role').lean().exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }

    const { _id, firstName, lastName, role, email, isEmailConfirmed, isFirstLogin } = user

    return { _id, firstName, lastName, role: role.value, email, isEmailConfirmed, isFirstLogin }
  },

  getUserByEmail: async (email) => {
    const user = await User.findOne({ email }).populate('role').lean().exec()

    if (!user) {
      return null
    }

    return user
  },

  updateUser: async (userId, param) => {
    const user = await User.findByIdAndUpdate(userId, param, { new: true }).exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }
  },

  deleteUser: async (userId) => {
    const user = await User.findByIdAndRemove(userId).exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }
  }
}

module.exports = userService
