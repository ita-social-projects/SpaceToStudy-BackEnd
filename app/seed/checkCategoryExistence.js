const Category = require('~/app/models/category')
const categories = require('~/app/consts/categories')
const SeedCategory = require('~/app/seed/seedCategory')
const logger = require('~/app/logger/logger')

const checkCategoryExistence = async () => {
  try {
    await Promise.all(
      Object.values(categories).map(async (category) => {
        const isCategoryExist = await Category.exists({ name: category.name })

        if (isCategoryExist) {
          return
        }

        return await SeedCategory.createCategory(category)
      })
    )
  } catch (err) {
    logger.error(err)
  }
}

module.exports = checkCategoryExistence
