const Quiz = require('~/models/quiz')

const quizService = {
  createQuiz: async (author, data) => {
    const { title, items } = data

    return await Quiz.create({
      title,
      author,
      items,
    })
  }
}

module.exports = quizService
