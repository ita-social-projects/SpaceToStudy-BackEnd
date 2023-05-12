const Offer = require('~/models/offer')
const userService = require('~/services/user')
const {
  roles: { STUDENT }
} = require('~/consts/auth')

const offerService = {
  getOffers: async (match, sort, skip, limit) => {
    const count = await Offer.countDocuments(match)

    const offers = await Offer.find(match)
      .populate([
        { path: 'author', select: ['totalReviews', 'photo', 'professionalSummary'] },
        { path: 'subject', select: 'name' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    return { count, offers }
  },

  getOfferById: async (id) => {
    return await Offer.findById(id)
      .populate([
        { path: 'author', select: ['totalReviews', 'photo', 'professionalSummary'] },
        { path: 'subject', select: 'name' }
      ])
      .lean()
      .exec()
  },

  getRelatedOffers: async (match, sort, skip, limit) => {
    return await Offer.find(match)
      .populate([
        { path: 'author', select: ['totalReviews', 'photo', 'professionalSummary'] },
        { path: 'subject', select: 'name' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
  },

  createOffer: async (author, authorRole, data) => {
    const { price, proficiencyLevel, description, languages, subject, category } = data

    const user = await userService.getUserById(author)

    const authorAvgRating = authorRole === STUDENT ? user.averageRating.student : user.averageRating.tutor
    const authorFirstName = user.firstName
    const authorLastName = user.lastName

    return await Offer.create({
      author,
      authorRole,
      authorAvgRating,
      authorFirstName,
      authorLastName,
      price,
      proficiencyLevel,
      description,
      languages,
      subject,
      category
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
