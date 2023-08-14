const finishedQuizService = require('~/services/finishedQuiz')

const getFinishedQuizzes = async (req, res) => {
  const { skip, limit } = req.query
  const { id: author } = req.user

  const quizzes = await finishedQuizService.getFinishedQuizzes(author, parseInt(skip), parseInt(limit))

  res.status(200).json(quizzes)
}

module.exports = {
  getFinishedQuizzes
}
