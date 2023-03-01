const Review = require('~/models/review')
const User = require('~/models/user')

const calculateAverageRatingAndTotalReviews = async (targetUserId) => {
  const [result] = await Review.aggregate([
    {
      $match: {
        targetUserId: targetUserId
      }
    },
    {
      $group: {
        _id: 'targetUserId',
        totalReviews: {
          $count: {}
        },
        averageRating: {
          $avg: '$rating'
        }
      }
    }
  ]).exec()

  if (result) {
    await User.findByIdAndUpdate(targetUserId, {
      totalReviews: result.totalReviews,
      averageRating: result.averageRating.toFixed(1)
    })
  } else {
    await User.findByIdAndUpdate(targetUserId, { totalReviews: 0, averageRating: 0 })
  }
}

module.exports = calculateAverageRatingAndTotalReviews
