const quizService = require('~/services/quiz')
const getRegex = require('~/utils/getRegex')

const getQuiz = async (req, res) => {
  const { id: author } = req.user
  const { title, sort, skip, limit } = req.query

  const match = { author, title: getRegex(title) }

  const reviews = await quizService.getQuiz(match, sort, parseInt(skip), parseInt(limit))

  res.status(200).json(reviews)
}

const createQuiz = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newQuiz = await quizService.createQuiz(author, data)

  res.status(201).send(newQuiz)
}

module.exports = {
  getQuiz,
  createQuiz
}
