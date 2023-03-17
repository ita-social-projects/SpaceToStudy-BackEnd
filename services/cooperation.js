const Cooperation = require('~/models/cooperation')
const { createError } = require('~/utils/errorsHelper')
const { COOPERATION_NOT_FOUND } = require('~/consts/errors')

const cooperationService = {
  getCooperations: async () => {
    const cooperations = await Cooperation.find().lean().exec()

    return cooperations
  },

  getCooperationById: async (id) => {
    const cooperation = await Cooperation.findById(id).lean().exec()

    if (!cooperation) {
      throw createError(404, COOPERATION_NOT_FOUND)
    }

    return cooperation
  },

  createCooperation: async (offerId, tutorId, studentId, price, status) => {
    const newCooperation = await Cooperation.create({
      offerId,
      tutorId,
      studentId,
      price,
      status
    })

    return newCooperation
  },

  updateCooperation: async (id, updateData) => {
    const cooperation = await Cooperation.findByIdAndUpdate(id, updateData).lean().exec()

    if (!cooperation) {
      throw createError(404, COOPERATION_NOT_FOUND)
    }
  },

  deleteCooperation: async (id) => {
    const cooperation = await Cooperation.findByIdAndRemove(id).exec()

    if (!cooperation) {
      throw createError(404, COOPERATION_NOT_FOUND)
    }
  }
}

module.exports = cooperationService
