const Category = require('~/models/category')

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
  }
}

module.exports = categoryService
