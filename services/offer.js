const Offer = require('~/models/offer')
const userService = require('~/services/user')

const offerService = {
  getOffers: async (match, sort, skip, limit) => {
    const count = await Offer.countDocuments(match)

    const offers = await Offer.find(match)
      .populate({ path: 'authorId', select: ['totalReviews', '+photo'] })
      .populate({ path: 'subjectId', select: 'name' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    return { count, offers }
  },

  getOfferById: async (id) => {
    return await Offer.findById(id).lean().exec()
  },

  createOffer: async (authorId, authorRole, offer) => {
    const { price, proficiencyLevel, description, languages, subjectId, categoryId } = offer

    const user = await userService.getUserById(authorId)

    const authorAvgRating = authorRole === 'student' ? user.averageRating.student : user.averageRating.tutor
    const authorFirstName = user.firstName
    const authorLastName = user.lastName

    return await Offer.create({
      authorId,
      authorRole,
      authorAvgRating,
      authorFirstName,
      authorLastName,
      price,
      proficiencyLevel,
      description,
      languages,
      subjectId,
      categoryId
    })
  },

  updateOffer: async (id, filteredFields) => {
    await Offer.findByIdAndUpdate(id, filteredFields, { new: true, runValidators: true }).lean().exec()
  },

  deleteOffer: async (id) => {
    await Offer.findByIdAndRemove(id).exec()
  }
}

module.exports = offerService
