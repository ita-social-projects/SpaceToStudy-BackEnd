const FinishedQuiz = require('~/app/models/finishedQuiz')
const Quiz = require('~/app/models/quiz')

const finishedQuizService = {
  getFinishedQuizzes: async (author, skip = 0, limit = 10) => {
    const authorQuizzes = await Quiz.distinct('_id', { author })

    const match = { quiz: { $in: authorQuizzes } }

    const items = await FinishedQuiz.find(match).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec()

    const count = await FinishedQuiz.countDocuments(match)

    return { items, count }
  },

  createFinishedQuiz: async (data) => {
    const { quiz, grade, results } = data

    return await FinishedQuiz.create({
      quiz,
      grade,
      results
    })
  }
}

module.exports = finishedQuizService
