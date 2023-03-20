const User = require('~/models/user')
const calculateReviewStats = require('~/utils/reviews/reviewStatsAggregation')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { USER_NOT_FOUND, ALREADY_REGISTERED, USER_DEACTIVATED } = require('~/consts/errors')

const {
  enums: { STATUS_ENUM }
} = require('~/consts/validation')

const userService = {
  getUsers: async ({ match, sort, skip, limit }) => {
    const count = await User.countDocuments(match)

    const items = await User.find(match)
      .select('+status')
      .sort(sort)
      .collation({ locale: 'en_US', strength: 2, caseLevel: false })
      .skip(skip)
      .limit(limit)
      .exec()

    return {
      items,
      count
    }
  },

  getOneUser: async (id, role) => {
    const user = await User.findOne({ _id: id, role })
      .populate('categories')
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers  +status')
      .lean()
      .exec()

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }

    if (user.status === STATUS_ENUM[2]) {
      throw createError(404, USER_DEACTIVATED)
    }

    const reviewStats = await calculateReviewStats(user._id, role)

    return { ...user, reviewStats }
  },

  getUserById: async (id) => {
    const user = await User.findById(id).select('+lastLoginAs +isEmailConfirmed +isFirstLogin').lean().exec()

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
  },

  userStatusChange: async (id) => {
    const user = await User.findByIdAndUpdate(id, { status: STATUS_ENUM[2] }).exec()

    console.log(user)

    if (!user) {
      throw createError(404, USER_NOT_FOUND)
    }

    return user
  }
}

module.exports = userService
