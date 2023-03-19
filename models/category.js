const { Schema, model } = require('mongoose')
const { refs: { OFFER } } = require('~/consts/models')

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
      ref: OFFER,
      required: true,
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
