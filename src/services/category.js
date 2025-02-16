const Category = require('~/models/category')
const Offer = require('~/models/offer')
const conditionCreator = require('~/utils/categories/conditionCreator')
const capitalizeFirstLetter = require('~/utils/capitalizeFirstLetter')
const recountOfferAmount = require('~/utils/offers/recountOfferAmount')

const categoryService = {
  getCategories: async (pipeline) => {
    const result = await Category.aggregate(pipeline).exec()

    return result[0]
  },

  getCategoriesNames: async (pipeline) => {
    return await Category.aggregate(pipeline).exec()
  },

  getCategoryById: async (id) => {
    return await Category.findById(id).lean().exec()
  },

  addCategory: async (data) => {
    let { name, appearance } = data

    name = capitalizeFirstLetter(name)

    return await Category.create({ name, appearance })
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
  },

  recountTotalOffers: async () => {
    const categories = await Category.aggregate(recountOfferAmount('category'))
    const categoryBulkOps = categories.map(({ _id, totalOffers }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { totalOffers } }
      }
    }))
    await Category.bulkWrite(categoryBulkOps)
  }
}

module.exports = categoryService
