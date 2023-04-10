const Review = require('~/models/review')
const calculateReviewStats = require('~/utils/reviews/reviewStatsAggregation')

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
    await Review.findByIdAndUpdate(id, updateData).lean().exec()
  },

  deleteReview: async (id) => {
    await Review.findByIdAndRemove(id).exec()
  }
}

module.exports = reviewService
