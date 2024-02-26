const categoryService = require('~/services/category')
const categoriesAggregateOptions = require('~/utils/categories/categoriesAggregateOptions')
const categoryNamesAggregateOptions = require('~/utils/categories/categoryNamesAggregateOptions')

const getCategories = async (req, res) => {
  const pipeline = categoriesAggregateOptions(req.query)

  const categories = await categoryService.getCategories(pipeline)

  res.status(200).json(categories)
}

const getCategoriesNames = async (_req, res) => {
  const pipeline = categoryNamesAggregateOptions()

  const categoriesNames = await categoryService.getCategoriesNames(pipeline)

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
