const quizService = require('~/services/quiz')

const createQuiz = async (req, res) => {
  const { id:author } = req.user 

  const data = req.body

  const newQuiz = await quizService.createQuiz(author, data)

  res.status(201).send(newQuiz)
}

module.exports = {
  createQuiz
}
