const Cooperation = require('~/models/cooperation')

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
