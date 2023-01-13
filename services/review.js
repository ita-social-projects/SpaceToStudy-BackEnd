const Review = require('~/models/review')
const { createError } = require('~/utils/errorsHelper')
const { REVIEW_NOT_FOUND } = require('~/consts/errors')

const reviewService = {
  getReviews: async () => {
    const reviews = await Review.find().lean().exec()

    return reviews
  },

  getReviewById: async (id) => {
    const review = await Review.findById(id).lean().exec()

    if (!review) {
      throw createError(404, REVIEW_NOT_FOUND)
    }

    return review
  },

  addReview: async (comment, rating, tutor, student) => {
    const newReview = await Review.create({
      comment,
      rating,
      tutor,
      student
    })

    return newReview
  },

  updateReview: async (id, updateData) => {
    const review = await Review.findByIdAndUpdate(id, updateData, { new: true }).lean().exec()

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
