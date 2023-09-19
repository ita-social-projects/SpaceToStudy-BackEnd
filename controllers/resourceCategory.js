const resourceCategoryService = require('~/services/resourceCategory')

const deleteResourceCategory = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user

  await resourceCategoryService.deleteResourceCategory(id, currentUser)

  res.status(204).end()
}
module.exports = {
  deleteResourceCategory
}
