const questionService = require('~/services/question')
const getRegex = require('~/utils/getRegex')
const getSortOptions = require('~/utils/getSortOptions')

const getQuestions = async (req, res) => {
  const { title, sort, skip, limit } = req.query

  const match = { title: getRegex(title) }
  const sortOptions = getSortOptions(sort)

  const questions = await questionService.getQuestions(match, sortOptions, parseInt(skip), parseInt(limit))

  res.status(200).json(questions)
}

const createQuestion = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newQuestion = await questionService.createQuestion(author, data)

  res.status(201).json(newQuestion)
}

module.exports = {
  getQuestions,
  createQuestion
}
