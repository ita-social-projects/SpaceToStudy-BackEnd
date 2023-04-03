const { Schema, model } = require('mongoose')
const { OFFER, CATEGORY } = require('~/consts/models')

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'User role must be selected.']
    },
    categoryIcon: {
      path: {
        type: String,
        required: [true, 'User role must be selected.']
      },
      color: {
        type: String,
        required: [true, 'User role must be selected.']
      }
    },
    totalOffers: {
      type: Number,
      ref: OFFER,
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

module.exports = model(CATEGORY, categorySchema)
