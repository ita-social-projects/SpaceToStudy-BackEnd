const { Schema, model } = require('mongoose')
const { OFFER, CATEGORY } = require('~/consts/models')

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Please, enter a category name']
    },
    categoryIcon: {
      path: {
        type: String,
        required: [true, 'Please, enter a category icon']
      },
      color: {
        type: String,
        required: [true, 'Please, enter a color of category icon']
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
    versionKey: false
  }
)

module.exports = model(CATEGORY, categorySchema)
