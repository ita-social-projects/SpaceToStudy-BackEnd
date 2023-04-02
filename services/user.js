const User = require('~/models/user')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedUserFieldsForUpdate } = require('~/validation/services/user')

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

  getUserById: async (id, role) => {
    const user = await User.findOne({ _id: id, ...(role && { role }) })
      .populate('categories')
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers')
      .lean()
      .exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
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

    return await User.create({
      role,
      firstName,
      lastName,
      email,
      lastLoginAs: role,
      password: hashedPassword,
      appLanguage,
      isEmailConfirmed
    })
  },

  privateUpdateUser: async (id, param) => {
    const user = await User.findByIdAndUpdate(id, param, { new: true }).exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
    }
  },
  
  updateUser: async (id, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedUserFieldsForUpdate)
    const user = await User.findByIdAndUpdate(id, filteredUpdateData).lean().exec()

    if(!user) {
      throw createError(404, DOCUMENT_NOT_FOUND(User.modelName))
    }
  },

  updateStatus: async (id, updateStatus) => {
    const statusesForChange = {} 
    for (const role in updateStatus) {
      statusesForChange['status.' + role] = updateStatus[role]
    }

    const user = await User.findByIdAndUpdate(id, { $set:statusesForChange } ).lean().exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND(User.modelName))
    }
  },

  deleteUser: async (id) => {
    await User.findByIdAndRemove(id).exec()
  }
}

module.exports = userService
