const { ObjectId } = require('mongodb')

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
const offerAggregateOptions = require('~/utils/offers/offerAggregateOptions')

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
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers +videoLink')
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
      filteredUpdateData.mainSubjects = await userService._updateMainSubjects(
        updateData.mainSubjects,
        user.mainSubjects,
        role
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
    let formattedSubjects = Array.isArray(mainSubjects) ? mainSubjects : [mainSubjects]

    const verifyUpdateSubject = (dbSubject, subject) => {
      return dbSubject._id.toString() === subject._id
    }

    const verifyDeletionSubject = (dbSubject, subject) => {
      return !subject.subjects.some((currentSubject) => dbSubject._id.toString() === currentSubject._id)
    }

    if (formattedSubjects.every((subject) => !subject.subjects)) {
      const categories = {}
      formattedSubjects.forEach((subject) => {
        if (!categories[subject.category._id]) {
          categories[subject.category._id] = [{ ...subject }]
        } else {
          categories[subject.category._id].push({ ...subject })
        }
      })

      const transformedSubjects = []
      for (const key in categories) {
        transformedSubjects.push({
          category: { _id: key, name: categories[key][0].category.name },
          subjects: categories[key].map(({ _id, name }) => ({ _id, name }))
        })
      }
      formattedSubjects = transformedSubjects
    }

    for (const currentSubject of formattedSubjects) {
      const isUpdate = oldSubjects?.some((subj) => verifyUpdateSubject(subj, currentSubject))
      const isDelete = !currentSubject.category.name

      if (isDelete) {
        const isDeletionBlocked = await userService._calculateDeletionMainSubject(userId, currentSubject.category._id)

        if (isDeletionBlocked) {
          throw createError(403, FORBIDDEN)
        }
        newSubjects[role] = oldSubjects.filter((subject) => verifyDeletionSubject(subject, currentSubject))
      } else if (isUpdate) {
        newSubjects[role] = oldSubjects.map((subject) =>
          verifyUpdateSubject(subject, currentSubject) ? currentSubject : subject
        )
      } else {
        newSubjects[role] = [currentSubject, ...newSubjects[role]]
      }
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
  },

  getBookmarkedOffers: async (userId, queryParams) => {
    let offersPipeline = offerAggregateOptions(queryParams, {}, { id: userId })
    if (queryParams.title) {
      const match = { $match: { title: { $regex: queryParams.title, $options: 'i' } } }
      offersPipeline = offersPipeline.map((stage) => (Object.keys(stage).includes('$match') ? match : stage))
    } else {
      offersPipeline = offersPipeline.filter((stage) => !Object.keys(stage).includes('$match'))
    }

    const [response] = await User.aggregate([
      { $match: { _id: ObjectId(userId) } },
      {
        $lookup: {
          from: 'offers',
          localField: 'bookmarkedOffers',
          foreignField: '_id',
          pipeline: offersPipeline,
          as: 'offers'
        }
      },
      { $project: { offers: 1, _id: 0 } },
      {
        $unwind: '$offers'
      }
    ]).exec()

    return { items: response.offers.items, count: response.offers.count }
  },

  _calculateDeletionMainSubject: async (userId, categoryId) => {
    const aggregateOptions = [{ $match: { category: categoryId, author: userId, status: OFFER_STATUS_ENUM[0] } }]
    const userOffers = await offerService.getOffers(aggregateOptions)
    const userCooperations = await cooperationService.getCooperations(aggregateOptions)

    return Boolean(userOffers || userCooperations)
  }
}

module.exports = userService
