const { Schema, model } = require('mongoose')
const userSchema = require('~/models/user')
const offerSchema = require('~/models/offer')
const { USER, OFFER } = require('~/consts/models')
const {
  roles: { STUDENT }
} = require('~/consts/auth')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')
const { ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')

const reviewSchema = new Schema(
  {
    comment: {
      type: String
    },
    rating: {
      type: Number
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: USER
    },
    targetUserRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('target user role', MAIN_ROLE_ENUM)
      }
    },
    offer: {
      type: Schema.Types.ObjectId,
      ref: OFFER
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

reviewSchema.index({ author: 1, targetUserId: 1 }, { unique: true })

reviewSchema.statics.calcAverageRatings = async function (targetUserId, targetUserRole) {
  const stats = await this.aggregate([
    {
      $match: { targetUserId, targetUserRole }
    },
    {
      $group: {
        _id: { targetUserId: '$targetUserId', targetUserRole: '$targetUserRole' },
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: {
          $push: {
            role: '$_id.targetUserRole',
            count: '$totalReviews'
          }
        },
        averageRating: {
          $push: {
            role: '$_id.targetUserRole',
            rating: '$averageRating'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalReviews: {
          $arrayToObject: {
            $map: {
              input: '$totalReviews',
              in: {
                k: '$$this.role',
                v: '$$this.count'
              }
            }
          }
        },
        averageRating: {
          $arrayToObject: {
            $map: {
              input: '$averageRating',
              in: {
                k: '$$this.role',
                v: '$$this.rating'
              }
            }
          }
        }
      }
    }
  ])

  if (stats.length) {
    const student = {
      'totalReviews.student': stats[0].totalReviews.student,
      'averageRating.student': stats[0].averageRating.student
    }

    const tutor = {
      'totalReviews.tutor': stats[0].totalReviews.tutor,
      'averageRating.tutor': stats[0].averageRating.tutor
    }

    const studentRating = { authorAvgRating: stats[0].averageRating.student }

    const tutorRating = { authorAvgRating: stats[0].averageRating.tutor }

    await userSchema.findOneAndUpdate(
      { _id: targetUserId, role: targetUserRole },
      targetUserRole === STUDENT ? student : tutor
    )

    await offerSchema.updateMany({ author: targetUserId }, targetUserRole === STUDENT ? studentRating : tutorRating)
  } else {
    await userSchema.findOneAndUpdate(
      { _id: targetUserId, role: targetUserRole },
      { totalReviews: { student: 0, tutor: 0 }, averageRating: { student: 0, tutor: 0 } }
    )

    await offerSchema.updateMany({ author: targetUserId }, { authorAvgRating: 0 })
  }
}

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.targetUserId, this.targetUserRole)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne().clone()

  next()
})

reviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calcAverageRatings(this.review.targetUserId, this.review.targetUserRole)
})

module.exports = model('Review', reviewSchema)
