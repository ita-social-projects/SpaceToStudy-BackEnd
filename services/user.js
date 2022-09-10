const User = require('~/models/user')
const Role = require('~/models/role')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')

const userService = {
  getUsers: async () => {
    const users = await User.find().populate('role').lean().exec()

    return users.map(({ _id, role, firstName, lastName, email, lastLogin }) => ({
      _id,
      role: role.value,
      firstName,
      lastName,
      email,
      lastLogin
    }))
  },

  getUserById: async (userId) => {
    const user = await User.findById(userId).populate('role').lean().exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }

    const { _id, role, firstName, lastName, email, isEmailConfirmed, isFirstLogin } = user

    return { _id, role: role.value, firstName, lastName, email, isEmailConfirmed, isFirstLogin }
  },

  getUserByEmail: async (email) => {
    const user = await User.findOne({ email }).populate('role').lean().exec()

    if (!user) {
      return null
    }

    user.role = user.role.value

    return user
  },

  createUser: async (role, firstName, lastName, email, password) => {
    const duplicateUser = await userService.getUserByEmail(email)

    if (duplicateUser) {
      throw createError(409, ALREADY_REGISTERED)
    }

    const foundRole = await Role.findOne({ value: role }).exec()
    const hashedPassword = await hashPassword(password)

    const newUser = await User.create({ role: foundRole, firstName, lastName, email, password: hashedPassword })

    return newUser
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
