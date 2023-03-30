const Offer = require('~/models/offer')
const { createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const offerService = {
  getOffers: async (match) => {
    const offers = await Offer.find(match).lean().exec()

    return offers
  },

  getOfferById: async (id) => {
    const offer = await Offer.findById(id).lean().exec()

    if (!offer) {
      throw createError(404, DOCUMENT_NOT_FOUND(Offer.modelName))
    }

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
    const offer = await Offer.findByIdAndUpdate(id, updateData).lean().exec()

    if (!offer) {
      throw createError(404, DOCUMENT_NOT_FOUND(Offer.modelName))
    }
  },

  deleteOffer: async (id) => {
    const offer = await Offer.findByIdAndRemove(id).exec()

    if (!offer) {
      throw createError(404, DOCUMENT_NOT_FOUND(Offer.modelName))
    }
  }
}

module.exports = offerService
