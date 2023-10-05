const ResourcesCategory = require('~/models/resourcesCategory')

const resourcesCategoryService = {
  createResourcesCategory: async (author, data) => {
    const { name } = data

    return await ResourcesCategory.create({
      name,
      author
    })
  },

  getResourcesCategories: async (match, sort, skip, limit) => {
    const items = await ResourcesCategory.find(match)
      .collation({ locale: 'en', strength: 1 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec()
    const count = await ResourcesCategory.countDocuments(match)

    return { count, items }
  },
  getResourcesCategoriesNames: async (match) => {
    return await ResourcesCategory.find(match).distinct('name').exec()
  }
}

module.exports = resourcesCategoryService
