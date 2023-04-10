const Cooperation = require('~/models/cooperation')

const cooperationService = {
  getCooperations: async () => {
    return await Cooperation.find().lean().exec()
  },

  getCooperationById: async (id) => {
    return await Cooperation.findById(id).lean().exec()
  },

  createCooperation: async (initiatorUserId, data) => {
    const { offerId, recipientUserId, price } = data

    return await Cooperation.create({
      initiatorUserId,
      offerId,
      recipientUserId,
      price
    })
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
