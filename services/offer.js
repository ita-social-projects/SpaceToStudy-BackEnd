const Offer = require('~/models/offer')

const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedOfferFieldsForUpdate } = require('~/validation/services/offer')

const offerService = {
  getOffers: async (pipeline) => {
    const [response] = await Offer.aggregate(pipeline).exec()
    return response
  },

  getOfferById: async (id) => {
    const offer = await Offer.findById(id)
      .populate([
        {
          path: 'author',
          select: ['firstName', 'lastName', 'totalReviews', 'averageRating', 'photo', 'professionalSummary', 'FAQ']
        },
        { path: 'subject', select: 'name' },
        { path: 'category', select: 'appearance' }
      ])
      .lean()
      .exec()

    if (offer.author.FAQ && offer.authorRole in offer.author.FAQ) {
      offer.author.FAQ = offer.author.FAQ[offer.authorRole]
    } else {
      delete offer.author.FAQ
    }

    return offer
  },

  createOffer: async (author, authorRole, data) => {
    const { price, proficiencyLevel, title, description, languages, subject, category, status, FAQ } = data

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
      status,
      FAQ
    })
  },

  updateOffer: async (id, currentUserId, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedOfferFieldsForUpdate)

    const offer = await Offer.findById(id)

    for (let field in filteredUpdateData) {
      offer[field] = filteredUpdateData[field]
    }

    await offer.validate()
    await offer.save()
  },

  deleteOffer: async (id) => {
    await Offer.findByIdAndRemove(id).exec()
  }
}

module.exports = offerService
