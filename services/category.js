const Category = require('~/models/category')
const Offer = require('~/models/offer')
const { createError } = require('~/utils/errorsHelper')
const { CATEGORY_NOT_FOUND, OFFER_NOT_FOUND } = require('~/consts/errors')
const mongoose = require('mongoose')

const categoryService = {
  getCategories: async (searchFilter, skip, limit) => {
    return await Category.find(searchFilter).skip(skip).limit(limit).lean().exec()
  },

  getCategoriesNames: async () => {
    return await Category.find().select('name').lean().exec()
  },

  getCategoryById: async (id) => {
    const category = await Category.findById(id).lean().exec()

    return category
  },

  priceMinMax: async (searchParams) => {
    if (!searchParams) {
      throw createError(404, OFFER_NOT_FOUND)
    }

    const condition = (data) => {
      if (!data.catid && !data.subid) {
        return { authorRole: searchParams.authorRole }
      } else if (!data.subid) {
        return {
          $and: [{ authorRole: searchParams.authorRole }, { categoryId: mongoose.Types.ObjectId(searchParams.catid) }]
        }
      } else if (!data.catid) {
        return {
          $and: [{ authorRole: searchParams.authorRole }, { subjectId: mongoose.Types.ObjectId(searchParams.subid) }]
        }
      } else {
        return {
          $and: [
            { authorRole: searchParams.authorRole },
            { categoryId: mongoose.Types.ObjectId(searchParams.catid) },
            { subjectId: mongoose.Types.ObjectId(searchParams.subid) }
          ]
        }
      }
    }

    const minMaxPrices = await Offer.aggregate([
      { $match: condition(searchParams) },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' }
        }
      }
    ])

    return { minPrice: minMaxPrices[0].min, maxPrice: minMaxPrices[0].max }
  }
}

module.exports = categoryService
