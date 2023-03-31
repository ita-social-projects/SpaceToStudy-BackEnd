const Category = require('~/models/category')
const { createError } = require('~/utils/errorsHelper')
const { CATEGORY_NOT_FOUND } = require('~/consts/errors')

const categoryService = {
  getCategories: async (searchFilter, skip, limit) => {
    return await Category.find(searchFilter).skip(skip).limit(limit).lean().exec()
  },

  getCategoriesNames: async () => {
    return await Category.find().select('name').lean().exec()
  },

  getCategoryById: async (id) => {
    const category = await Category.findById(id).lean().exec()

    if (!category) {
      throw createError(404, CATEGORY_NOT_FOUND)
    }

    return category
  }
}

module.exports = categoryService
