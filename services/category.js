const Category = require('~/models/category')
const { createError } = require('~/utils/errorsHelper')
const { CATEGORY_NOT_FOUND } = require('~/consts/errors')

const categoryService = {
  getCategories: async () => {
    return await Category.find().populate('subjects').lean().exec()
  },

  getCategoryById: async (id) => {
    const category = await Category.findById(id).populate('subjects').lean().exec()

    if (!category) {
      throw createError(404, CATEGORY_NOT_FOUND)
    }

    return category
  }
}

module.exports = categoryService
