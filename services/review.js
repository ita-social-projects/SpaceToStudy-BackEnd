const Review = require('~/models/review')
const { createError } = require('~/utils/errorsHelper')
const { REVIEW_NOT_FOUND } = require('~/consts/errors')

const reviewService = {
  getReviews: async (targetUserId, targetUserRole) => {
    return await Review.find({ targetUserId, targetUserRole }).populate('author offer').lean().exec()
  },

  getReviewById: async (id) => {
    const review = await Review.findById(id).populate('author offer').lean().exec()

    if (!review) {
      throw createError(404, REVIEW_NOT_FOUND)
    }

    return review
  },

  addReview: async (comment, rating, author, targetUserId, targetUserRole, offer) => {
    const newReview = await Review.create({
      comment,
      rating,
      author,
      targetUserId,
      targetUserRole,
      offer
    })

    return await newReview.populate('author offer')
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
