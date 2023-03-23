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

  createCooperation: async (offerId, tutorId, studentId, price) => {
    const newCooperation = await Cooperation.create({
      offerId,
      tutorId,
      studentId,
      price
    })

    return newCooperation
  },

  updateCooperation: async (id, updateData) => {
    const { price, status } = updateData
    const filteredData = {
      ...(price && { price }),
      ...(status && { status })
    }
    const cooperation = await Cooperation.findByIdAndUpdate(id, filteredData, { new: true }).lean().exec()

    if (!cooperation) {
      throw createError(404, COOPERATION_NOT_FOUND)
    }

    return cooperation
  }
}

module.exports = cooperationService
