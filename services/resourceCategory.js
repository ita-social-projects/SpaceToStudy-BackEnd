const resourceCategory = require('~/models/resourcesCategory')
const { createForbiddenError } = require('~/utils/errorsHelper')

const resourceCategoryService = {
  deleteResourceCategory: async (id, currentUser) => {
    const item = await resourceCategory.findById(id).exec()

    const resourceCategoryAuthor = item.author.toString()

    if (resourceCategoryAuthor !== currentUser) {
      throw createForbiddenError()
    }

    await resourceCategory.findByIdAndRemove(id).exec()
  }
}

module.exports = resourceCategoryService
