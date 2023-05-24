const Cooperation = require('~/models/cooperation')

const cooperationService = {
<<<<<<< HEAD
  getCooperations: async ({ skip, limit, match, sortOptions }) => {
    return await Cooperation.find(match).sort(sort).skip(skip).limit(limit)
=======
  getCooperations: async ({ skip = 0, limit = 5, match, sort }) => {
    return await Cooperation.find(match).sort(sort).skip(skip).limit(limit).lean().exec()
>>>>>>> e1441bb (sorting and filtering)
  },

  getCooperationById: async (id) => {
    return await Cooperation.findById(id).populate('offer', ['id', 'author', 'price']).lean().exec()
  },

  createCooperation: async (initiator, data) => {
    const { offer, requiredProficiencyLevel, requiredLanguage, additionalInfo, receiver, price } = data

    return await Cooperation.create({
      initiator,
      receiver,
      offer,
      price,
      requiredLanguage,
      requiredProficiencyLevel,
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
