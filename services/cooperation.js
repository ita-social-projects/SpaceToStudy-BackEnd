const Cooperation = require('~/models/cooperation')
const { createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const cooperationService = {
  getCooperations: async () => {
    const cooperations = await Cooperation.find().lean().exec()

    return cooperations
  },

  getCooperationById: async (id) => {
    const cooperation = await Cooperation.findById(id).lean().exec()

    if (!cooperation) {
      throw createError(404, DOCUMENT_NOT_FOUND(Cooperation.modelName))
    }

    return cooperation
  },

  createCooperation: async (offerId, initiatorUserId, recipientUserId, price) => {
    const newCooperation = await Cooperation.create({
      offerId,
      initiatorUserId,
      recipientUserId,
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
      throw createError(404, DOCUMENT_NOT_FOUND(Cooperation.modelName))
    }
  }
}

module.exports = cooperationService
