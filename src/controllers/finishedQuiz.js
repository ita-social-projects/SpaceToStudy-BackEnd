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

const getFinishedQuizById = async (req, res) => {
  const { id } = req.params

  const quiz = await finishedQuizService.getFinishedQuizById(id)

  res.status(200).json(quiz)
}

const updateFinishedQuiz = async (req, res) => {
  const { id } = req.params

  const { role } = req.user

  const updateData = req.body

  await finishedQuizService.updateFinishedQuiz(id, updateData, role)

  res.status(204).end()
}

module.exports = {
  getFinishedQuizzes,
  createFinishedQuiz,
  getFinishedQuizById,
  updateFinishedQuiz
}
