const Review = require('~/models/review')
const calculateReviewStats = require('~/utils/reviews/reviewStatsAggregation')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedReviewFieldsForUpdate } = require('~/validation/services/review')

const reviewService = {
  getReviews: async (match, skip, limit) => {
    const count = await Review.countDocuments(match)

    const reviews = await Review.find(match)
      .populate({ path: 'author', select: ['firstName', 'lastName', 'photo'] })
      .populate({
        path: 'offer',
        select: ['subjectId', 'proficiencyLevel', 'categoryId'],
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'subjectId', select: 'name' }
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
        select: ['subjectId', 'proficiencyLevel', 'categoryId'],
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'subjectId', select: 'name' }
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

  updateReview: async (id, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedReviewFieldsForUpdate)
    const review = await Review.findByIdAndUpdate(id, filteredUpdateData, { new: true, runValidators: true }).exec()

    if (!review) {
      throw createError(DOCUMENT_NOT_FOUND(Review.modelName))
    }
  },

  deleteReview: async (id) => {
    await Review.findByIdAndRemove(id).exec()
  }
}

module.exports = reviewService
