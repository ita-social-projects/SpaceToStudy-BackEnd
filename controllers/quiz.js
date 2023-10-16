const quizService = require('~/services/quiz')
const getRegex = require('~/utils/getRegex')
const getSortOptions = require('~/utils/getSortOptions')

const getQuizzes = async (req, res) => {
  const { id: author } = req.user
  const { title, sort, skip, limit } = req.query

  const match = { author, title: getRegex(title) }
  const sortOptions = getSortOptions(sort)

  const quizzes = await quizService.getQuiz(match, sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(quizzes)
}

const getQuizById = async (req, res) => {
  const { id } = req.params

  const quiz = await quizService.getQuizById(id)

  res.status(200).json(quiz)
}

const createQuiz = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newQuiz = await quizService.createQuiz(author, data)

  res.status(201).send(newQuiz)
}

const updateQuiz = async (req, res) => {
  const { id } = req.params
  const { id: currentUserId } = req.user
  const updateData = req.body

  await quizService.updateQuiz(id, currentUserId, updateData)

  res.status(204).end()
}

const deleteQuiz = async (req, res) => {
  const { id } = req.params
  const currentUser = req.user

  await quizService.deleteQuiz(id, currentUser)

  res.status(204).end()
}

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
}
