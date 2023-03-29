const Offer = require('~/models/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { OFFER_NOT_FOUND, CATEGORY_NOT_FOUND, SUBJECT_NOT_FOUND } = require('~/consts/errors')

const offerService = {
  getOffers: async (match) => {
    const offers = await Offer.find(match).lean().exec()

    return offers
  },

  getOfferById: async (id) => {
    const offer = await Offer.findById(id).lean().exec()

    return offer
  },

  createOffer: async (authorRole, authorId, offer) => {
    const { price, proficiencyLevel, description, languages, subjectId, categoryId } = offer

    const category = await Category.findById(categoryId).lean().exec()

    if (!category) {
      throw createError(404, CATEGORY_NOT_FOUND)
    }

    const subject = await Subject.findById(subjectId).lean().exec()

    if (!subject) {
      throw createError(404, SUBJECT_NOT_FOUND)
    }

    const newOffer = await Offer.create({
      authorRole,
      authorId,
      price,
      proficiencyLevel,
      description,
      languages,
      subjectId,
      categoryId
    })

    return newOffer
  },

  updateOffer: async (id, filteredFields) => {
    const offer = await Offer.findByIdAndUpdate(id, filteredFields, { new: true, runValidators: true }).lean().exec()

    if (!offer) {
      throw createError(404, OFFER_NOT_FOUND)
    }
  },

  deleteOffer: async (id) => {
    const offer = await Offer.findByIdAndRemove(id).exec()
    if (!offer) {
      throw createError(404, OFFER_NOT_FOUND)
    }
  },

  priceMinMax: async (authorRole) => {
    if (!authorRole) {
      throw createError(404, OFFER_NOT_FOUND)
    }

    const minMaxPrices = await Offer.aggregate([
      { $match: { authorRole: 'tutor' } },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' }
        }
      }
    ])

    return { minPrice: minMaxPrices[0].min, maxPrice: minMaxPrices[0].max }
  }
}

module.exports = offerService
