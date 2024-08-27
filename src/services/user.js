const User = require('~/models/user')
const uploadService = require('~/services/upload')
const { USER } = require('~/consts/upload')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED, FORBIDDEN } = require('~/consts/errors')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedUserFieldsForUpdate } = require('~/validation/services/user')
const {
  enums: { MAIN_ROLE_ENUM, OFFER_STATUS_ENUM }
} = require('~/consts/validation')
const { allowedTutorFieldsForUpdate } = require('~/validation/services/user')
const { shouldDeletePreviousPhoto } = require('~/utils/users/photoCheck')
const offerService = require('./offer')
const cooperationService = require('./cooperation')
const mongoose = require('mongoose')

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

  getUserById: async (id, role, isEdit = false) => {
    const populateOptions = (role) => ({
      path: `mainSubjects.${role}`,
      populate: [
        {
          path: 'category',
          select: ['_id', 'name', 'appearance']
        },
        {
          path: 'subjects',
          select: ['_id', 'name']
        }
      ]
    })

    const user = await User.findOne({ _id: id, ...(role && { role }) })
      .populate(populateOptions('tutor'))
      .populate(populateOptions('student'))
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers +videoLink +notificationSettings')
      .lean()
      .exec()
    if (isEdit) {
      for (const key in user.mainSubjects) {
        const userSubjects = await Promise.all(
          user.mainSubjects[key].map(async (subject) => {
            const isDeletionBlocked = await userService._calculateDeletionMainSubject(user._id, subject.category._id)
            return { ...subject, isDeletionBlocked }
          })
        ).catch((err) => {
          console.log(err)
        })
        user.mainSubjects[key] = userSubjects
      }
    }

    return user
  },

  getUserByEmail: async (email) => {
    const user = await User.findOne({ email })
      .select('+password +lastLoginAs +isEmailConfirmed +isFirstLogin +appLanguage +notificationSettings')
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
      isEmailConfirmed,
      notificationSettings: {
        isOfferStatusNotification: true,
        isChatNotification: true,
        isSimilarOffersNotification: true,
        isEmailNotification: true
      }
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
      filteredUpdateData.mainSubjects = await userService._updateMainSubjects(
        updateData.mainSubjects,
        user.mainSubjects,
        role,
        id
      )
    }

    if ('videoLink' in updateData) {
      filteredUpdateData.videoLink = {
        ...user.videoLink,
        [role]: updateData.videoLink
      }
    }

    await User.findByIdAndUpdate(id, filteredUpdateData, { new: true, runValidators: true }).lean().exec()
  },

  _updateMainSubjects: async (mainSubjects, userSubjects, role, userId) => {
    const oldSubjects = userSubjects[role]
    let newSubjects = { ...userSubjects }
    let formattedSubjects = mainSubjects[role]
    formattedSubjects = Array.isArray(formattedSubjects) ? formattedSubjects : [formattedSubjects]

    const verifyUpdateSubject = (dbSubject, subject) => {
      if (!dbSubject?._id || !subject?._id) {
        return false
      }

      const dbSubjectId = dbSubject._id.toString()
      const subjectId = subject._id.toString()

      return dbSubjectId === subjectId
    }

    const updateSingleCategory = (oldCategory, newCategory) => {
      const oldSubjectIds = new Set(oldCategory.subjects.map((subject) => subject._id.toString()))
      const newSubjectIds = new Set(newCategory.subjects.map((subject) => subject._id.toString()))
      const isEqual =
        oldSubjectIds.size === newSubjectIds.size && [...oldSubjectIds].every((id) => newSubjectIds.has(id))

      return isEqual ? oldCategory : newCategory
    }

    const processedCategoryIds = new Set()

    for (const subject of formattedSubjects) {
      const currentSubject = subject

      if (!currentSubject) {
        continue
      }

      const updateIndex = oldSubjects.findIndex((item) => verifyUpdateSubject(item, currentSubject))

      if (updateIndex >= 0) {
        newSubjects[role][updateIndex] = updateSingleCategory(newSubjects[role][updateIndex], currentSubject)
      } else {
        if (!currentSubject._id || !mongoose.isValidObjectId(currentSubject._id)) {
          currentSubject._id = new mongoose.Types.ObjectId()
        }

        newSubjects[role] = [...newSubjects[role], currentSubject]
      }

      processedCategoryIds.add(currentSubject.category._id.toString())
    }

    newSubjects[role] = await Promise.all(
      newSubjects[role].map(async (oldSubject) => {
        const shouldKeep = processedCategoryIds.has(oldSubject.category?._id?.toString())

        if (!shouldKeep) {
          const isDeletionBlocked = await userService._calculateDeletionMainSubject(userId, oldSubject.category)

          if (isDeletionBlocked) {
            throw createError(403, FORBIDDEN)
          }

          return null
        }

        return oldSubject
      })
    )

    newSubjects[role] = newSubjects[role].filter((subject) => subject !== null)

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
  },

  _calculateDeletionMainSubject: async (userId, categoryId) => {
    const aggregateOptions = [{ $match: { category: categoryId, author: userId, status: OFFER_STATUS_ENUM[0] } }]
    const userOffers = await offerService.getOffers(aggregateOptions)
    const userCooperations = await cooperationService.getCooperations(aggregateOptions)

    return Boolean(userOffers?.length || userCooperations?.length)
  }
}

module.exports = userService
