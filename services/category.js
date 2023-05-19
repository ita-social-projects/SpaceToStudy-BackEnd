const Category = require('~/models/category')
const Offer = require('~/models/offer')
const conditionCreator = require('~/utils/categories/conditionCreator')
const capitalizeFirstLetter = require('~/utils/capitalizeFirstLetter')

const categoryService = {
  getCategories: async (searchFilter, skip, limit) => {
    return await Category.find(searchFilter).skip(skip).limit(limit).sort({ totalOffers: -1 }).lean().exec()
  },

  getCategoriesNames: async () => {
    return await Category.find().select('name').lean().exec()
  },

  getCategoryById: async (id) => {
    return await Category.findById(id).lean().exec()
  },

  addCategory: async (data) => {
    let { name, categoryIcon } = data

    if (name[0] === name[0].toLowerCase()) {
      name = capitalizeFirstLetter(name)
    }

    return await Category.create({ name, categoryIcon })
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
    if (!minMaxPrices.length) minMaxPrices[0] = { min: 0, max: 0 }

    return { minPrice: minMaxPrices[0].min, maxPrice: minMaxPrices[0].max }
  }
}

module.exports = categoryService
