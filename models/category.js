const { Schema, model } = require('mongoose')

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    categoryIcon: {
      type: String,
      require: true,
    },
    subjectsIcon: {
      type: String,
      require: true
    },
    totalOffers: {
      type: Number,
      ref: 'Offer',
      required: true,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }

  }
)

module.exports = model('Category', categorySchema)
