const Cooperation = require('~/models/cooperation')

const cooperationService = {
  getCooperations: async (match) => {
    const count = await Cooperation.countDocuments(match)

    const cooperations = await Cooperation.find(match).populate('offer', ['id', 'author', 'price']).lean().exec()

    return { count, cooperations }
  },

  getCooperationById: async (id) => {
    return await Cooperation.findById(id).populate('offer', ['id', 'author', 'price']).lean().exec()
  },

  createCooperation: async (initiator, data) => {
    const { offer, requiredTutoringLevel, requiredLanguage, additionalInfo, receiver, subject, price } = data

    return await Cooperation.create({
      initiator,
      receiver,
      offer,
      subject,
      price,
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
