const Offer = require('~/models/offer')
const userService = require('~/services/user')
const subjectService = require('~/services/subject')

const {
  roles: { STUDENT }
} = require('~/consts/auth')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedOfferFieldsForUpdate } = require('~/validation/services/offer')

const offerService = {
  getOffers: async (match, sort, skip, limit) => {
    const count = await Offer.countDocuments(match)

    const offers = await Offer.find(match)
      .populate([
        { path: 'author', select: ['totalReviews', 'photo', 'professionalSummary', 'FAQ'] },
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
    const { price, proficiencyLevel, title, description, languages, subject: subjectId, category, FAQ } = data

    const user = await userService.getUserById(author)
    const subject = await subjectService.getSubjectById(subjectId)

    const authorAvgRating = authorRole === STUDENT ? user.averageRating.student : user.averageRating.tutor
    const authorFirstName = user.firstName
    const authorLastName = user.lastName
    const subjectName = subject.name

    return await Offer.create({
      author,
      authorRole,
      authorAvgRating,
      authorFirstName,
      authorLastName,
      price,
      proficiencyLevel,
      title,
      description,
      languages,
      subjectName,
      subject: subjectId,
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
