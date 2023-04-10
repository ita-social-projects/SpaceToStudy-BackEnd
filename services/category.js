const Category = require('~/models/category')
const Offer = require('~/models/offer')
const conditionCreator = require('~/utils/categories/conditionCreator')

const categoryService = {
  getCategories: async (searchFilter, skip, limit) => {
    return await Category.find(searchFilter).skip(skip).limit(limit).lean().exec()
  },

  getCategoriesNames: async () => {
    return await Category.find().select('name').lean().exec()
  },

  getCategoryById: async (id) => {
    return await Category.findById(id).lean().exec()
  },

  priceMinMax: async (searchParams) => {
    const matchCondition = conditionCreator.condition(searchParams)

    const minMaxPrices = await Offer.aggregate([
      { $match: matchCondition },
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
