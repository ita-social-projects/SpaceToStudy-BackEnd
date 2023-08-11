const finishedQuizService = require('~/services/finishedQuiz')

const getFinishedQuizzes = async (req, res) => {
  const { skip, limit } = req.query

  const quizzes = await finishedQuizService.getFinishedQuizzes(parseInt(skip), parseInt(limit))

  res.status(200).json(quizzes)
}

module.exports = {
  getFinishedQuizzes
}
