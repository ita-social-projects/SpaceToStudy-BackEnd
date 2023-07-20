const Cooperation = require('~/models/cooperation')
const { createError, createForbiddenError } = require('~/utils/errorsHelper')
const { VALIDATION_ERROR } = require('~/consts/errors')

const cooperationService = {
  getCooperations: async (pipeline) => {
    const [result] = await Cooperation.aggregate(pipeline).exec()

    return result
  },

  getCooperationById: async (id) => {
    return await Cooperation.findById(id).populate('offer', ['id', 'author', 'price']).lean().exec()
  },

  createCooperation: async (initiator, initiatorRole, data) => {
    const { offer, proficiencyLevel, additionalInfo, receiver, receiverRole, price } = data

    return await Cooperation.create({
      initiator,
      initiatorRole,
      receiver,
      receiverRole,
      offer,
      price,
      proficiencyLevel,
      additionalInfo,
      needAction: receiverRole
    })
  },

  updateCooperation: async (id, currentUser, updateData) => {
    const { role: currentUserRole } = currentUser
    const { price, status } = updateData

    if (price && status) {
      throw createError(409, VALIDATION_ERROR('You can change only either the status or the price in one operation'))
    }

    const cooperation = await Cooperation.findById(id)

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
