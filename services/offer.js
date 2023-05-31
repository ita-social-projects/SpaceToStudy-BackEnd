const Offer = require('~/models/offer')

const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedOfferFieldsForUpdate } = require('~/validation/services/offer')

const offerService = {
  getOffers: async (pipeline) => {
    return await Offer.aggregate(pipeline).exec()
  },

  getOfferById: async (id) => {
    const offer = await Offer.findById(id)
      .populate([
        { path: 'author', select: ['totalReviews', 'photo', 'professionalSummary', 'FAQ'] },
        { path: 'subject', select: 'name' }
      ])
      .lean()
      .exec()

    offer.author.FAQ = offer.author.FAQ[offer.authorRole]

    return offer
  },

  createOffer: async (author, authorRole, data) => {
    const { price, proficiencyLevel, title, description, languages, subject, category, FAQ } = data

    return await Offer.create({
      author,
      authorRole,
      price,
      proficiencyLevel,
      title,
      description,
      languages,
      subject,
      category,
      FAQ
    })
  },

  updateOffer: async (id, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedOfferFieldsForUpdate)

    await Offer.findByIdAndUpdate(id, filteredUpdateData, { new: true, runValidators: true }).lean().exec()
  },

  deleteOffer: async (id) => {
    await Offer.findByIdAndRemove(id).exec()
  }
}

module.exports = offerService
