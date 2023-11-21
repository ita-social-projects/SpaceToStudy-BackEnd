const questionService = require('~/services/question')
const getCategoriesOptions = require('~/utils/getCategoriesOption')
const getMatchOptions = require('~/utils/getMatchOptions')
const getRegex = require('~/utils/getRegex')
const getSortOptions = require('~/utils/getSortOptions')

const getQuestions = async (req, res) => {
  const { id: author } = req.user
  const { title, sort, skip, limit, categories } = req.query
  const categoriesOptions = getCategoriesOptions(categories)

  const match = getMatchOptions({
    author,
    title: getRegex(title),
    category: categoriesOptions
  })
  const sortOptions = getSortOptions(sort)

  const questions = await questionService.getQuestions(match, sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(questions)
}

const getQuestionById = async (req, res) => {
  const { id } = req.params

  const question = await questionService.getQuestionById(id)

  res.status(200).json(question)
}

const createQuestion = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newQuestion = await questionService.createQuestion(author, data)

  res.status(201).json(newQuestion)
}

const deleteQuestion = async (req, res) => {
  const userId = req.user.id
  const { id } = req.params

  await questionService.deleteQuestion(id, userId)

  res.status(204).end()
}

const updateQuestion = async (req, res) => {
  const { id } = req.params
  const { id: currentUserId } = req.user
  const data = req.body

  const updatedQuestion = await questionService.updateQuestion(id, currentUserId, data)

  res.status(200).json(updatedQuestion)
}

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
  updateQuestion
}
