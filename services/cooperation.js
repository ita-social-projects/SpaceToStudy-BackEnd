const Cooperation = require('~/models/cooperation')
const { createError, createForbiddenError } = require('~/utils/errorsHelper')
const { VALIDATION_ERROR, DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const cooperationService = {
  getCooperations: async (pipeline) => {
    const [result] = await Cooperation.aggregate(pipeline).exec()

    return result
  },

  getCooperationById: async (id) => {
    return await Cooperation.findById(id).populate('offer', ['id', 'author', 'price']).lean().exec()
  },

  createCooperation: async (initiator, initiatorRole, data) => {
    const {
      offer,
      proficiencyLevel,
      additionalInfo,
      receiver,
      receiverRole,
      price,
      availableQuizzes,
      finishedQuizzes
    } = data

    return await Cooperation.create({
      initiator,
      initiatorRole,
      receiver,
      receiverRole,
      offer,
      price,
      proficiencyLevel,
      additionalInfo,
      needAction: receiverRole,
      availableQuizzes,
      finishedQuizzes
    })
  },

  updateCooperation: async (id, currentUser, updateData) => {
    const { id: currentUserId, role: currentUserRole } = currentUser
    const { price, status } = updateData

    if (price && status) {
      throw createError(409, VALIDATION_ERROR('You can change only either the status or the price in one operation'))
    }

    const cooperation = await Cooperation.findById(id)
    if (!cooperation) {
      throw createError(DOCUMENT_NOT_FOUND(Cooperation.modelName))
    }

    const initiator = cooperation.initiator.toString()
    const receiver = cooperation.receiver.toString()

    if (initiator !== currentUserId && receiver !== currentUserId) {
      throw createForbiddenError()
    }

    if (price) {
      if (currentUserRole !== cooperation.needAction) {
        throw createForbiddenError()
      }
      cooperation.price = price
      cooperation.needAction = cooperation.needAction === 'student' ? 'tutor' : 'student'

      await cooperation.save()
    }
    if (status) {
      cooperation.status = status
      await cooperation.save()
    }
  }
}

module.exports = cooperationService
