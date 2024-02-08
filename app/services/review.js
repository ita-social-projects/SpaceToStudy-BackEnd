const Review = require('~/app/models/review')
const calculateReviewStats = require('~/app/utils/reviews/reviewStatsAggregation')
const { DOCUMENT_NOT_FOUND } = require('~/app/consts/errors')
const { createError, createForbiddenError } = require('~/app/utils/errorsHelper')
const filterAllowedFields = require('~/app/utils/filterAllowedFields')
const { allowedReviewFieldsForUpdate } = require('~/app/validation/services/review')

const reviewService = {
  getReviews: async (match, skip, limit) => {
    const count = await Review.countDocuments(match)

    const reviews = await Review.find(match)
      .populate({ path: 'author', select: ['firstName', 'lastName', 'photo'] })
      .populate({
        path: 'offer',
        select: ['subject', 'proficiencyLevel', 'category'],
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subject', select: 'name' }
        ]
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    return {
      count,
      reviews
    }
  },

  getReviewStatsByUserId: async (id, role) => {
    return await calculateReviewStats(id, role)
  },

  getReviewById: async (id) => {
    return await Review.findById(id)
      .populate({ path: 'author', select: ['firstName', 'lastName', 'photo'] })
      .populate({
        path: 'offer',
        select: ['subject', 'proficiencyLevel', 'category'],
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subject', select: 'name' }
        ]
      })
      .lean()
      .exec()
  },

  addReview: async (author, data) => {
    const { comment, rating, targetUserId, targetUserRole, offer } = data

    return await Review.create({
      comment,
      rating,
      author,
      targetUserId,
      targetUserRole,
      offer
    })
  },

  updateReview: async (id, currentUserId, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedReviewFieldsForUpdate)

    const review = await Review.findById(id).exec()
    if (!review) {
      throw createError(DOCUMENT_NOT_FOUND(Review.modelName))
    }

    const author = review.author.toString()

    if (author !== currentUserId) {
      throw createForbiddenError()
    }

    for (const field in filteredUpdateData) {
      review[field] = filteredUpdateData[field]
    }
    await review.save()
  },

  deleteReview: async (id) => {
    await Review.findByIdAndRemove(id).exec()
  }
}

module.exports = reviewService
