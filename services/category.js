const Category = require('~/models/category')

const categoryService = {
  getCategories: async (searchFilter, skip, limit) => {
    const categories = await Category.find(searchFilter).skip(skip).limit(limit).lean().exec()
    
    return categories
  },

  getCategoriesNames: async () => {
    const categoriesNames = await Category.find().select('name').lean().exec()
  
    return categoriesNames
  },

  getCategoryById: async (id) => {
    const category = await Category.findById(id).lean().exec()

    return category
  }
}

module.exports = categoryService
