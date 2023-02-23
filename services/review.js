const Review = require('~/models/review')
const { createError } = require('~/utils/errorsHelper')
const { REVIEW_NOT_FOUND, REVIEW_ALREADY_EXISTS } = require('~/consts/errors')

const reviewService = {
  getReviews: async () => {
    return await Review.find().lean().exec()
  },

  getReviewById: async (id) => {
    const review = await Review.findById(id).lean().exec()

    if (!review) {
      throw createError(404, REVIEW_NOT_FOUND)
    }

    return review
  },

  addReview: async (comment, rating, authorId, targetUserId, targetUserRole, offerId) => {
    const reviewPresent = await Review.findOne({ authorId, targetUserId, offerId }).lean().exec()

    if (reviewPresent) {
      throw createError(404, REVIEW_ALREADY_EXISTS)
    }

    const newReview = await Review.create({
      comment,
      rating,
      authorId,
      targetUserId,
      targetUserRole,
      offerId
    })

    return newReview
  },

  updateReview: async (id, updateData) => {
    const review = await Review.findByIdAndUpdate(id, updateData).lean().exec()

    if (!review) {
      throw createError(404, REVIEW_NOT_FOUND)
    }
  },

  deleteReview: async (id) => {
    const review = await Review.findByIdAndRemove(id).exec()

    if (!review) {
      throw createError(404, REVIEW_NOT_FOUND)
    }
  }
}

module.exports = reviewService
