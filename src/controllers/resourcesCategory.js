const resourcesCategoryService = require('~/services/resourcesCategory')
const getMatchOptions = require('~/utils/getMatchOptions')
const getSortOptions = require('~/utils/getSortOptions')
const getRegex = require('~/utils/getRegex')

const createResourcesCategory = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newResourcesCategory = await resourcesCategoryService.createResourcesCategory(author, data)

  res.status(201).send(newResourcesCategory)
}

const getResourcesCategories = async (req, res) => {
  const { id: author } = req.user
  const { name, sort, skip, limit } = req.query

  const match = getMatchOptions({ author, name: getRegex(name) })
  const sortOptions = getSortOptions(sort)

  const resourcesCategories = await resourcesCategoryService.getResourcesCategories(
    match,
    sortOptions,
    parseInt(skip),
    parseInt(limit)
  )

  res.status(200).json(resourcesCategories)
}

const getResourcesCategoriesNames = async (req, res) => {
  const { id: author } = req.user

  const match = getMatchOptions({ author })

  const resourcesCategoriesNames = await resourcesCategoryService.getResourcesCategoriesNames(match)

  res.status(200).json(resourcesCategoriesNames)
}

const updateResourceCategory = async (req, res) => {
  const { id } = req.params
  const { id: author } = req.user
  const updateData = req.body

  await resourcesCategoryService.updateResourceCategory(id, author, updateData)

  res.status(204).end()
}

const deleteResourceCategory = async (req, res) => {
  const { id } = req.params
  const { id: currentUser } = req.user

  await resourcesCategoryService.deleteResourceCategory(id, currentUser)

  res.status(204).end()
}

module.exports = {
  getResourcesCategories,
  createResourcesCategory,
  getResourcesCategoriesNames,
  updateResourceCategory,
  deleteResourceCategory
}
