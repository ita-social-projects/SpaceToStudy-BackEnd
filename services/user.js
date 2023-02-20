const User = require('~/models/user')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')

const userService = {
  getUsers: async () => {
    const users = await User.find().populate('categories').select('-__v').lean().exec()

    return users
  },

  getUserById: async (id) => {
    const user = await User.findById(id)
      .populate('categories')
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers -__v')
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

  createUser: async (role, firstName, lastName, email, password, appLanguage, isEmailConfirmed = false) => {
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
      lastLoginAs: role,
      password: hashedPassword,
      appLanguage,
      isEmailConfirmed
    })

    return newUser
  },

  updateUser: async (id, param) => {
    const user = await User.findByIdAndUpdate(id, param, { new: true }).exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }
  },

  deleteUser: async (id) => {
    const user = await User.findByIdAndRemove(id).exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }
  }
}

module.exports = userService
