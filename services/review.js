const Review = require('~/models/review')
const calculateReviewStats = require('~/utils/reviews/reviewStatsAggregation')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedReviewFieldsForUpdate } = require('~/validation/services/review')

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
