const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')

const User = require('~/models/user')
const Offer = require('~/models/offer')
const uploadService = require('~/services/upload')
const { USER } = require('~/consts/upload')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError, createBadRequestError } = require('~/utils/errorsHelper')

const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED, FORBIDDEN } = require('~/consts/errors')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedUserFieldsForUpdate } = require('~/validation/services/user')
const {
  enums: { MAIN_ROLE_ENUM, OFFER_STATUS_ENUM }
} = require('~/consts/validation')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const { allowedTutorFieldsForUpdate } = require('~/validation/services/user')
const { allowedStudentFieldsForUpdate } = require('~/validation/services/user')
const { shouldDeletePreviousPhoto } = require('~/utils/users/photoCheck')
const offerService = require('./offer')
const offerAggregateOptions = require('~/utils/offers/offerAggregateOptions')

const notificationService = require('./notification')
const attachmentService = require('./attachment')
const lessonService = require('./lesson')
const quizService = require('./quiz')
const questionService = require('./question')
const resourcesCategoryService = require('./resourcesCategory')
const noteService = require('./note')
const courseService = require('./course')
const tokenService = require('./token')
const reviewService = require('./review')
const cooperationService = require('./cooperation')
const chatService = require('./chat')
const messageService = require('./message')

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
      .select(
        '+lastLoginAs +isEmailConfirmed +isFirstLogin +bookmarkedOffers +videoLink +notificationSettings +lastSeen'
      )
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
      .select('+password +lastLoginAs +isEmailConfirmed +isFirstLogin +appLanguage +notificationSettings +lastSeen')
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

    if (role === ADMIN) {
      throw createBadRequestError()
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
        : { ...allowedUserFieldsForUpdate, ...allowedStudentFieldsForUpdate }

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

  updateLastSeen: async (id) => {
    const user = await User.findById(id).lean().exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
    }

    await User.findByIdAndUpdate(id, { $set: { lastSeen: Date.now() } }, { new: true })
      .lean()
      .exec()
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
    await Promise.all([
      notificationService.clearNotifications(id),
      attachmentService.deleteAttachementsByAuthor(id),
      lessonService.deleteLessonsByAuthor(id),
      quizService.deleteQuizzesByAuthor(id),
      questionService.deleteQuestionsByAuthor(id),
      resourcesCategoryService.deleteResourceCategoriesByAuthor(id),
      noteService.deleteNotesByAuthor(id),
      courseService.deleteCoursesByAuthor(id),
      reviewService.deleteReviewsByAuthorOrTarget(id),
      cooperationService.deleteCooperationsByUser(id),
      offerService.deleteOffersByAuthor(id),
      chatService.deleteChatsbyUser(id),
      messageService.deleteAllMessagesByUser(id),
      tokenService.deleteTokensByUser(id)
    ])

    await User.findByIdAndRemove(id)
  },

  toggleOfferBookmark: async (offerId, userId) => {
    const offer = await Offer.findById(offerId)

    if (!offer) throw createError(404, DOCUMENT_NOT_FOUND([Offer.modelName]))

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      [
        {
          $set: {
            bookmarkedOffers: {
              $cond: [
                { $in: [ObjectId(offerId), '$bookmarkedOffers'] },
                { $setDifference: ['$bookmarkedOffers', [ObjectId(offerId)]] },
                { $concatArrays: ['$bookmarkedOffers', [ObjectId(offerId)]] }
              ]
            }
          }
        }
      ],
      { new: true }
    ).select('+bookmarkedOffers')

    return updatedUser.bookmarkedOffers
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

    return Boolean(userOffers?.length || userCooperations?.length)
  },

  checkOwnership: async (model, ownerFields, resourceId, userId, relationshipModel = null) => {
    const resource = await model.findById(resourceId)
    if (!resource) throw createError(404, DOCUMENT_NOT_FOUND([model.resourceType]))

    const isOwner = ownerFields.some((field) => resource[field] && resource[field].toString() === userId)
    if (isOwner) return resource

    if (relationshipModel) {
      const { sectionsResources, resourceField, userFields } = relationshipModel.dynamicPaths

      const query = {
        [sectionsResources]: { $elemMatch: { [resourceField]: resourceId } },
        $or: userFields.map((field) => ({ [field]: userId }))
      }

      const isRelated = await relationshipModel.model.findOne(query)

      if (isRelated) return resource
    }

    throw createError(403, FORBIDDEN)
  },

  checkAvailability: async ({ model, relationshipModel, resourceId, userId, expectedAvailability = 'open' }) => {
    const { sectionsResources, resourceField, availabilityField } = relationshipModel.dynamicPaths

    const isAuthor = await model.findOne({ _id: resourceId, author: userId })

    if (isAuthor) {
      return true
    }

    const elemMatchQuery = {
      [resourceField]: resourceId
    }

    if (availabilityField) {
      elemMatchQuery[availabilityField] = expectedAvailability
    }

    const query = {
      [sectionsResources]: { $elemMatch: elemMatchQuery }
    }

    const isAvailable = await relationshipModel.model.findOne(query)

    if (!isAvailable) {
      throw createError(403, FORBIDDEN)
    }

    return true
  }
}

module.exports = userService
