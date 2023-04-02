const Offer = require('~/models/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { CATEGORY_NOT_FOUND, SUBJECT_NOT_FOUND } = require('~/consts/errors')

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

  updateOffer: async (id, updateData) => {
    await Offer.findByIdAndUpdate(id, updateData).lean().exec()
  },

  deleteOffer: async (id) => {
    await Offer.findByIdAndRemove(id).exec()
  }
}

module.exports = offerService
