const { Schema, model } = require('mongoose')

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: false,
      default: null
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetUserRole: {
      type: String,
      required: true
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    }
  },
  { timestamps: true }
)

reviewSchema.index({ authorId: 1, targetUserId: 1, offerId: 1 }, { unique: true })

module.exports = model('Review', reviewSchema)
