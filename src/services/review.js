const Review = require('~/models/review')
const calculateReviewStats = require('~/utils/reviews/reviewStatsAggregation')
const { createForbiddenError, createError } = require('~/utils/errorsHelper')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedReviewFieldsForUpdate } = require('~/validation/services/review')
const cooperationService = require('./cooperation')
const { CANNOT_TARGET_SELF } = require('~/consts/errors')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')
const getReviewsAggregateOptions = require('~/utils/reviews/getReviewsAggregateOptions')

const reviewService = {
  getReviews: async (match, skip, limit) => {
    skip = parseInt(skip) || null
    limit = parseInt(limit) || null

    const count = await Review.countDocuments(match).skip(skip).limit(limit).exec()

    const pipeline = getReviewsAggregateOptions(match, skip, limit)
    const reviews = await Review.aggregate(pipeline).exec()

    return {
      count,
      reviews
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

    if (author === targetUserId) {
      throw createError(400, CANNOT_TARGET_SELF)
    }

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

  deleteReview: async (id, currentUserId) => {
    const review = await Review.findById(id).lean().exec()
    const { targetUserId, targetUserRole } = review

    const author = review.author.toString()
    if (author !== currentUserId) {
      throw createForbiddenError()
    }

    await Review.findByIdAndRemove(id).exec()
    await calculateReviewStats(targetUserId, targetUserRole)
  },

  deleteReviewsByAuthorOrTarget: async (userId) => {
    const reviewsCreatedByUser = await Review.find({ author: userId })

    await Review.deleteMany({
      $or: [{ author: userId }, { targetUserId: userId }]
    })

    await Promise.all(MAIN_ROLE_ENUM.map((role) => calculateReviewStats(userId, role)))

    await Promise.all(
      reviewsCreatedByUser.map((review) => calculateReviewStats(review.targetUserId, review.targetUserRole))
    )
  }
}

module.exports = reviewService
