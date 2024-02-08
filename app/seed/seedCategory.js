const Category = require('~/app/models/category')
const logger = require('~/app/logger/logger')

const SeedCategory = {
  createCategory: async (category) => {
    try {
      return await Category.create(category)
    } catch (err) {
      logger.error(err)
    }
  }
}

module.exports = SeedCategory
