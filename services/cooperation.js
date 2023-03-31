const Cooperation = require('~/models/cooperation')

const cooperationService = {
  getCooperations: async () => {
    const cooperations = await Cooperation.find().lean().exec()

    return cooperations
  },

  getCooperationById: async (id) => {
    const cooperation = await Cooperation.findById(id).lean().exec()

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

    await Cooperation.findByIdAndUpdate(id, filteredData, { new: true }).lean().exec()
  }
}

module.exports = cooperationService
