const Review = require('~/models/review')
const calculateReviewStats = require('~/utils/reviews/reviewStatsAggregation')
const { createForbiddenError } = require('~/utils/errorsHelper')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedReviewFieldsForUpdate } = require('~/validation/services/review')
const cooperationService = require('./cooperation')

const reviewService = {
  getReviews: async (match, skip, limit) => {
    const count = await Review.countDocuments(match)

    const reviews = await Review.find(match)
      .populate({
        path: 'author',
        select: ['firstName', 'lastName', 'photo']
      })
      .populate({
        path: 'offer',
        select: ['subject', 'category'],
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subject', select: 'name' }
        ]
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    if (reviews.length === 0) {
      return { count, reviews }
    }

    const offerIds = reviews.map((review) => review.offer)
    const authorIds = reviews.map((review) => review.author)
    const targetUserIds = reviews.map((review) => review.targetUserId)

    const reviewRelevantCooperations = await cooperationService.getCooperationsByOfferAndUsers(
      offerIds,
      authorIds,
      targetUserIds
    )

    const reviewsWithProficiency = reviews.map((review) => {
      const reviewRelevantCooperation = reviewRelevantCooperations.find((cooperation) => {
        const offerMatch = cooperation.offer.toString() === review.offer._id.toString()

        const authorMatch =
          cooperation.receiver.toString() === review.author._id.toString() &&
          cooperation.initiator.toString() === review.targetUserId.toString()

        const targetUserMatch =
          cooperation.receiver.toString() === review.targetUserId.toString() &&
          cooperation.initiator.toString() === review.author._id.toString()
        return offerMatch && (authorMatch || targetUserMatch)
      })

      const reviewProficiencyLevel = reviewRelevantCooperation?.proficiencyLevel || null
      return { ...review, proficiencyLevel: reviewProficiencyLevel }
    })

    return {
      count,
      reviews: reviewsWithProficiency
    }
  },

  getReviewById: async (id) => {
    const review = await Review.findById(id)
      .populate({ path: 'author', select: ['firstName', 'lastName', 'photo'] })
      .populate({
        path: 'offer',
        select: ['subject', 'category'],
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subject', select: 'name' }
        ]
      })
      .lean()
      .exec()

    const {
      offer: { _id: offerId },
      author,
      targetUserId
    } = review
    review.proficiencyLevel = await cooperationService.getProficiencyLevel(offerId, author, targetUserId)

    return review
  },

  addReview: async (author, data) => {
    const { comment, rating, targetUserId, targetUserRole, offer } = data

    const review = await Review.create({
      comment,
      rating,
      author,
      targetUserId,
      targetUserRole,
      offer
    })

    await calculateReviewStats(targetUserId, targetUserRole)

    return review
  },

  updateReview: async (id, currentUserId, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedReviewFieldsForUpdate)

    const review = await Review.findById(id).exec()

    const author = review.author.toString()

    if (author !== currentUserId) {
      throw createForbiddenError()
    }

    for (const field in filteredUpdateData) {
      review[field] = filteredUpdateData[field]
    }

    await review.save()

    const { targetUserId, targetUserRole } = review
    await calculateReviewStats(targetUserId, targetUserRole)
  },

  deleteReview: async (id) => {
    const review = await Review.findById(id).lean().exec()
    const { targetUserId, targetUserRole } = review

    await Review.findByIdAndRemove(id).exec()
    await calculateReviewStats(targetUserId, targetUserRole)
  }
}

module.exports = reviewService
