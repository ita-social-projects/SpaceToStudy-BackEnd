const Cooperation = require('~/models/cooperation')
const mergeArraysUniqueValues = require('~/utils/mergeArraysUniqueValues')
const removeArraysUniqueValues = require('~/utils/removeArraysUniqueValues')
const getCooperationByIdQueryPipeline = require('~/utils/cooperations/getCooperationByIdQueryPipeline')
const handleResources = require('~/utils/handleResources')
const { createError, createForbiddenError } = require('~/utils/errorsHelper')
const { VALIDATION_ERROR, DOCUMENT_NOT_FOUND, ROLE_REQUIRED_FOR_ACTION } = require('~/consts/errors')
const { roles } = require('~/consts/auth')
const {
  enums: { COOPERATION_STATUS_ENUM }
} = require('~/consts/validation')

const cooperationService = {
  _validateCooperationUser: (cooperation, userId) => {
    const initiator = cooperation.initiator.toString()
    const receiver = cooperation.receiver.toString()

    if (initiator !== userId && receiver !== userId) {
      throw createForbiddenError()
    }
  },

  getCooperations: async (pipeline) => {
    const [result] = await Cooperation.aggregate(pipeline).exec()
    return result
  },

  getCooperationById: async (id, userRole) => {
    const isClosedResourcesHidden = userRole === roles.STUDENT

    const pipeline = getCooperationByIdQueryPipeline(id, isClosedResourcesHidden)

    const [cooperationById] = await Cooperation.aggregate(pipeline)

    return cooperationById
  },

  createCooperation: async (initiator, initiatorRole, data) => {
    const { offer, proficiencyLevel, additionalInfo, receiver, receiverRole, price, title, sections } = data

    return await Cooperation.create({
      initiator,
      initiatorRole,
      receiver,
      receiverRole,
      title,
      offer,
      sections,
      price,
      proficiencyLevel,
      additionalInfo,
      needAction: receiverRole
    })
  },

  updateCooperation: async (id, currentUser, updateData) => {
    const { id: currentUserId, role: currentUserRole } = currentUser
    const { price, status, availableQuizzes, finishedQuizzes, sections } = updateData

    if (price && status) {
      throw createError(409, VALIDATION_ERROR('You can change only either the status or the price in one operation'))
    }

    const cooperation = await Cooperation.findById(id)
    cooperationService._validateCooperationUser(cooperation, currentUserId)

    if (price) {
      if (currentUserRole !== cooperation.needAction.toString()) {
        throw createForbiddenError()
      }
      const updatedNeedAction = cooperation.needAction.toString() === 'student' ? 'tutor' : 'student'

      await Cooperation.findByIdAndUpdate(id, { price, needAction: updatedNeedAction }).exec()
    }
    if (status) {
      const isRequestToClose = status === COOPERATION_STATUS_ENUM[4]
      const otherRole = currentUserRole === roles.STUDENT ? roles.TUTOR : roles.STUDENT
      const updatedNeedAction = isRequestToClose ? otherRole : undefined

      await Cooperation.findByIdAndUpdate(id, { status, needAction: updatedNeedAction }, { runValidators: true })
    }
    if (sections) {
      cooperation.sections = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          resources: await handleResources(section.resources)
        }))
      )

      cooperation.markModified('sections')

      await cooperation.validate()
      await cooperation.save()
    }
    if (availableQuizzes) {
      cooperation.availableQuizzes = mergeArraysUniqueValues(cooperation.availableQuizzes, availableQuizzes)
      await cooperation.save()
    }
    if (finishedQuizzes) {
      cooperation.finishedQuizzes = mergeArraysUniqueValues(cooperation.finishedQuizzes, finishedQuizzes)
      cooperation.availableQuizzes = removeArraysUniqueValues(cooperation.availableQuizzes, cooperation.finishedQuizzes)
      await cooperation.save()
    }
  },

  updateResourceCompletionStatus: async ({ id, currentUser, resourceId, completionStatus }) => {
    const { id: currentUserId, role: currentUserRole } = currentUser

    if (currentUserRole !== roles.STUDENT) {
      throw createError(403, ROLE_REQUIRED_FOR_ACTION(roles.STUDENT))
    }

    const cooperation = await Cooperation.findById(id)
    cooperationService._validateCooperationUser(cooperation, currentUserId)

    let resourceIdExists = false

    for (const section of cooperation.sections) {
      for (const resource of section.resources) {
        if (resource.resource.toString() === resourceId) {
          resource.completionStatus = completionStatus
          resourceIdExists = true
          break
        }
      }
    }

    if (!resourceIdExists) {
      throw createError(404, DOCUMENT_NOT_FOUND([`Resource in ${Cooperation.modelName}`]))
    }

    cooperation.markModified('sections')

    await cooperation.validate()
    await cooperation.save()
  },

  getProficiencyLevel: async (offerId, requesterId, partnerId) => {
    const proficiencyLevel = await Cooperation.findOne({
      offer: offerId,
      $or: [
        {
          receiver: requesterId,
          initiator: partnerId
        },
        {
          receiver: partnerId,
          initiator: requesterId
        }
      ]
    })
      .select('proficiencyLevel')
      .lean()
      .exec()

    return proficiencyLevel?.proficiencyLevel ?? null
  },

  openScheduledCooperationResources: async (currentDate) => {
    await Cooperation.updateMany(
      {
        sections: { $exists: true },
        'sections.resources': { $exists: true },
        'sections.resources.availability.status': 'openFrom',
        'sections.resources.availability.data': {
          $ne: null,
          $lte: currentDate
        }
      },
      {
        $set: {
          'sections.$[].resources.$[resource].availability.status': 'open',
          'sections.$[].resources.$[resource].availability.date': null
        }
      },
      {
        arrayFilters: [
          {
            resource: { $exists: true },
            'resource.availability.date': {
              $ne: null,
              $lte: currentDate
            }
          }
        ]
      }
    )
  }
}

module.exports = cooperationService
