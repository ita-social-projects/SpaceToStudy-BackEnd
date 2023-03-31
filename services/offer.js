const Offer = require('~/models/offer')

const offerService = {
  getOffers: async (match) => {
    const offers = await Offer.find(match).lean().exec()

    return offers
  },

  getOfferById: async (id) => {
    const offer = await Offer.findById(id).lean().exec()

    return offer
  },

  createOffer: async (params) => {
    const { authorRole, userId, price, proficiencyLevel, description, languages, subjectId, categoryId, isActive } =
      params

    const newOffer = await Offer.create({
      authorRole,
      userId,
      price,
      proficiencyLevel,
      description,
      languages,
      subjectId,
      categoryId,
      isActive
    })

    return newOffer
  },

  updateOffer: async (id, updateData) => {
    await Offer.findByIdAndUpdate(id, updateData).lean().exec()
  },

  deleteOffer: async (id) => {
    await Offer.findByIdAndRemove(id).exec()
  }
}

module.exports = offerService
