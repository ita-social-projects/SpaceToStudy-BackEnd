const Review = require('~/models/review')

const calculateReviewStats = async (targetUserId) => {
  const reviews = await Review.aggregate([
    {
      $match: {
        targetUserId: targetUserId
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ])

  const counts = {}

  reviews.forEach((review) => {
    counts[review._id] = review.count
  })

  return counts
}

module.exports = calculateReviewStats
