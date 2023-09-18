const resourcesCategoryService = require('~/services/resourcesCategory')
const getMatchOptions = require('~/utils/getMatchOptions')
const getSortOptions = require('~/utils/getSortOptions')
const getRegex = require('~/utils/getRegex')

const getResourcesCategories = async (req, res) => {
  const { id: author } = req.user
  const { name, sort, skip, limit } = req.query

  const match = getMatchOptions({ author, name: getRegex(name) })
  const sortOptions = getSortOptions(sort)

  const resourcesCategories = await resourcesCategoryService.getAttachments(
    match,
    sortOptions,
    parseInt(skip),
    parseInt(limit)
  )

  res.status(200).json(resourcesCategories)
}

module.exports = {
  getResourcesCategories
}
