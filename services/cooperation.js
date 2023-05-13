const Cooperation = require('~/models/cooperation')

const cooperationService = {
  getCooperations: async () => {
    return await Cooperation.find().populate('offer', ['id', 'author', 'price']).lean().exec()
  },

  getCooperationById: async (id) => {
    return await Cooperation.findById(id).populate('offer', ['id', 'author', 'price']).lean().exec()
  },

  createCooperation: async (initiatorUserId, data) => {
    const { offer, requiredTutoringLevel, requiredLanguage, additionalInfo } = data

    return await Cooperation.create({
      initiatorUserId,
      offer,
      requiredLanguage,
      requiredTutoringLevel,
      additionalInfo
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
