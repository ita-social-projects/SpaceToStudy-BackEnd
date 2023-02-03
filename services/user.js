const User = require('~/models/user')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')

const userService = {
  getUsers: async () => {
    const users = await User.find().populate('categories').lean().exec()

    return users
  },

  getUserById: async (userId) => {
    const user = await User.findById(userId)
      .populate('categories')
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin')
      .lean()
      .exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }

    return user
  },

  getUserByEmail: async (email) => {
    const user = await User.findOne({ email })
      .select('+password +lastLoginAs +isEmailConfirmed +isFirstLogin +appLanguage')
      .lean()
      .exec()

    if (!user) {
      return null
    }

    return user
  },

  createUser: async (role, firstName, lastName, email, password, appLanguage) => {
    const duplicateUser = await userService.getUserByEmail(email)

    if (duplicateUser) {
      throw createError(409, ALREADY_REGISTERED)
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await User.create({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      appLanguage
    })

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
