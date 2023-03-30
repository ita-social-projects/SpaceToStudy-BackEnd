const User = require('~/models/user')
const calculateReviewStats = require('~/utils/reviews/reviewStatsAggregation')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')

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
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers')
      .lean()
      .exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND(User.modelName))
    }

    const reviewStats = await calculateReviewStats(user._id, role)

    return { ...user, reviewStats }
  },

  getUserById: async (id) => {
    const user = await User.findById(id).select('+lastLoginAs +isEmailConfirmed +isFirstLogin').lean().exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND(User.modelName))
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

  privateUpdateUser: async (id, param) => {
    const user = await User.findByIdAndUpdate(id, param, { new: true }).exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND(User.modelName))
    }
  },

  updateUser: async (id, updateStatus) => {
    const statusesForChange = {}
    for (const role in updateStatus) {
      statusesForChange['status.' + role] = updateStatus[role]
    }

    const user = await User.findByIdAndUpdate(id, { $set: statusesForChange }, { new: true }).exec()
    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND(User.modelName))
    }
  },

  deleteUser: async (id) => {
    const user = await User.findByIdAndRemove(id).exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND(User.modelName))
    }
  }
}

module.exports = userService
