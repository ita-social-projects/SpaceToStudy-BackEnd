const User = require('~/models/user')
const uploadService = require('~/services/upload')
const { USER } = require('~/consts/upload')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedUserFieldsForUpdate } = require('~/validation/services/user')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')
const { allowedTutorFieldsForUpdate } = require('~/validation/services/user')
const { shouldDeletePreviousPhoto } = require('~/utils/users/photoCheck')

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
    const populateOptions = (role) => ({
      path: `mainSubjects.${role}`,
      populate: [
        {
          path: 'category',
          select: ['_id', 'name']
        },
        {
          path: 'subjects',
          select: ['_id', 'name']
        }
      ]
    })
    return await User.findOne({ _id: id, ...(role && { role }) })
      .populate(populateOptions('tutor'))
      .populate(populateOptions('student'))
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers +videoLink')
      .lean()
      .exec()
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

  updateUser: async (id, role, updateData) => {
    const allowedFields =
      role === MAIN_ROLE_ENUM[1]
        ? { ...allowedUserFieldsForUpdate, ...allowedTutorFieldsForUpdate }
        : allowedUserFieldsForUpdate

    const filteredUpdateData = filterAllowedFields(updateData, allowedFields)

    const user = await User.findById(id).lean().exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
    }

    if (shouldDeletePreviousPhoto(user.photo, updateData.photo)) {
      await uploadService.deleteFile(user.photo, USER)
    }

    if (updateData.photo) {
      const mainData = updateData.photo.src.split(',')[1]
      const buffer = Buffer.from(mainData, 'base64')

      const photoUrl = await uploadService.uploadFile(updateData.photo.name, buffer, USER)
      filteredUpdateData.photo = photoUrl
    }

    if ('mainSubjects' in updateData) {
      filteredUpdateData.mainSubjects = userService._updateMainSubjects(
        updateData.mainSubjects,
        user.mainSubjects,
        role
      )
      // filteredUpdateData.mainSubjects = { tutor: [], student: [] }
    }

    if ('videoLink' in updateData) {
      filteredUpdateData.videoLink = {
        ...user.videoLink,
        [role]: updateData.videoLink
      }
    }

    await User.findByIdAndUpdate(id, filteredUpdateData, { new: true, runValidators: true }).lean().exec()
  },

  _updateMainSubjects: (mainSubject, userSubjects, role) => {
    const compareIds = (dbSubject, subject) => dbSubject._id.toString() === subject._id

    const oldSubjects = userSubjects[role]
    const isUpdate = oldSubjects.some((subj) => compareIds(subj, mainSubject))
    const isDelete = !mainSubject.category.name

    let newSubjects = { ...userSubjects }
    if (isDelete) {
      newSubjects[role] = oldSubjects.filter((subj) => !compareIds(subj, mainSubject))
    } else if (isUpdate) {
      newSubjects[role] = oldSubjects.map((subj) => (compareIds(subj, mainSubject) ? mainSubject : subj))
    } else {
      newSubjects[role] = [mainSubject, ...oldSubjects]
    }

    return newSubjects
  },

  updateStatus: async (id, updateStatus) => {
    const statusesForChange = {}

    for (const role in updateStatus) {
      statusesForChange['status.' + role] = updateStatus[role]
    }

    const user = await User.findByIdAndUpdate(id, { $set: statusesForChange }, { new: true }).lean().exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
    }
  },

  deleteUser: async (id) => {
    await User.findByIdAndRemove(id).exec()
  }
}

module.exports = userService
