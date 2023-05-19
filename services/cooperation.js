const Cooperation = require('~/models/cooperation')

const cooperationService = {
  getCooperations: async ({ skip, limit, match, sortOptions }) => {
    return await Cooperation.find(match)
      .populate([
        {
          path: 'offerId',
          options: {
            ...(sortOptions.firstName && { authorFirstName: sortOptions.firstName })
          }
        }
      ])
      .sort({ ...(sortOptions.updatedAt && { updatedAt: sortOptions.updatedAt }) })
      .skip(skip)
      .limit(limit)
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
