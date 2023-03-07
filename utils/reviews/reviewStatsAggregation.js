const Review = require('~/models/review')

const calculateReviewStats = async (targetUserId, targetUserRole) => {
  const reviews = await Review.aggregate([
    {
      $match: {
        targetUserId,
        targetUserRole
      }
    },
    {
      $facet: {
        numbers: [
          {
            $group: {
              _id: {
                user: '$targetUserId',
                rating: '$rating'
              },
              count: {
                $sum: 1.0
              }
            }
          },
          {
            $group: {
              _id: '$_id.user',
              counts: {
                $push: {
                  rating: '$_id.rating',
                  count: '$count'
                }
              },
              totalReviews: { $sum: '$count' },
              totalRating: { $sum: { $multiply: ['$_id.rating', { $sum: '$count' }] } }
            }
          }
        ]
      }
    },
    {
      $unwind: '$numbers'
    },
    {
      $project: {
        _id: 0,
        averageRating: { $divide: ['$numbers.totalRating', '$numbers.totalReviews'] },
        totalReviews: '$numbers.totalReviews',
        stats: '$numbers.counts'
      }
    }
  ])

  return { reviews }
}

module.exports = calculateReviewStats
