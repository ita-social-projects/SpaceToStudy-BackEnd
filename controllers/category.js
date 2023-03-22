const categoryService = require('~/services/category')

const getCategories = async (req, res) => {
  const { match, skip, limit } = req.query

  const searchFilter = match ? { name: { $regex: `${match}` } } : {}

  const categories = await categoryService.getCategories(searchFilter, parseInt(skip), parseInt(limit))

  res.status(200).json(categories)
}
const getCategoryById = async (req, res) => {
  const { id } = req.params

  const category = await categoryService.getCategoryById(id)

  res.status(200).json(category)
}

//TODO: must be done after offers and cooperations logic
//const addCategory = async (req, res) => {}
//const updateCategory = async (req, res) => {}
//const deleteCategory = async (req, res) => {}

module.exports = {
  getCategories,
  getCategoryById
}
