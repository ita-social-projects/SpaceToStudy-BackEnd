const Offer = require('~/models/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')
const userService = require('~/services/user')
const { createError } = require('~/utils/errorsHelper')
const { OFFER_NOT_FOUND, CATEGORY_NOT_FOUND, SUBJECT_NOT_FOUND } = require('~/consts/errors')

const offerService = {
  getOffers: async (match, sort, limit) => {
    const offers = await Offer.find(match)
      .populate({ path: 'userId', select: ['totalReviews', '+photo'] })
      .sort(sort)
      .limit(limit)
      .lean()
      .exec()

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

    const user = await userService.getUserById(authorId)

    const authorAvgRating = authorRole === 'student' ? user.averageRating.student : user.averageRating.tutor
    const authorName = `${user.firstName} ${user.lastName}`

    const newOffer = await Offer.create({
      authorRole,
      authorId,
      authorAvgRating,
      authorName,
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
  }
}

module.exports = offerService
