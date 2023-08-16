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

const createQuiz = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newQuiz = await quizService.createQuiz(author, data)

  res.status(201).send(newQuiz)
}

const deleteQuiz = async (req, res) => {
  const { id } = req.params
  const { id: currentUserId } = req.user

  await quizService.deleteQuiz(id, currentUserId)

  res.status(204).end()
}

module.exports = {
  getQuizzes,
  createQuiz,
  deleteQuiz
}
