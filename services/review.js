const Review = require('~/models/review')

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

  getReviewById: async (id) => {
    const review = await Review.findById(id)
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

    return newReview
  },

  updateReview: async (id, updateData) => {
    await Review.findByIdAndUpdate(id, updateData).lean().exec()
  },

  deleteReview: async (id) => {
    await Review.findByIdAndRemove(id).exec()
  }
}

module.exports = reviewService
