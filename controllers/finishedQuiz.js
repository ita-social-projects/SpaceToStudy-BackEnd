const finishedQuizService = require('~/services/finishedQuiz')

const getFinishedQuizzes = async (req, res) => {
  const { skip, limit } = req.query
  const { id: author } = req.user

  const quizzes = await finishedQuizService.getFinishedQuizzes(author, skip, limit)

  res.status(200).json(quizzes)
}

const createFinishedQuiz = async (req, res) => {
  const data = req.body

  const newFinishedQuiz = await finishedQuizService.createFinishedQuiz(data)

  res.status(201).json(newFinishedQuiz)
}

module.exports = {
  getFinishedQuizzes,
  createFinishedQuiz
}
