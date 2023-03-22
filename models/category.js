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
      required: true
    },
    totalOffers: {
      type: Number,
      ref: 'Offer',
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

module.exports = model('Category', categorySchema)
