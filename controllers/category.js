const categoryService = require('~/services/category')
const getRegex = require('~/utils/getRegex')

const getCategories = async (req, res) => {
  const { name, skip, limit } = req.query

  const searchFilter = { name: getRegex(name) }

  const categories = await categoryService.getCategories(searchFilter, parseInt(skip), parseInt(limit))

  const count = await categoryService.getCategoriesCount(searchFilter)

  res.status(200).json({ categories, count })
}

const getCategoriesNames = async (_req, res) => {
  const categoriesNames = await categoryService.getCategoriesNames()

  res.status(200).json(categoriesNames)
}

const getCategoryById = async (req, res) => {
  const { id } = req.params

  const category = await categoryService.getCategoryById(id)

  res.status(200).json(category)
}

const addCategory = async (req, res) => {
  const data = req.body

  const newCategory = await categoryService.addCategory(data)

  res.status(201).json(newCategory)
}

const priceMinMax = async (req, res) => {
  const { categoryId, subjectId } = req.params
  const { authorRole } = req.query

  const values = await categoryService.priceMinMax({ categoryId, subjectId, authorRole })

  res.status(200).json(values)
}

module.exports = {
  getCategories,
  getCategoryById,
  addCategory,
  priceMinMax,
  getCategoriesNames
}
