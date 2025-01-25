const FinishedQuiz = require('~/models/finishedQuiz')
const Quiz = require('~/models/quiz')
const cooperationService = require('~/services/cooperation')

const finishedQuizService = {
  getFinishedQuizzes: async (author, skip = 0, limit = 10) => {
    const authorQuizzes = await Quiz.distinct('_id', { author })

    const match = { quiz: { $in: authorQuizzes } }

    const items = await FinishedQuiz.find(match).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec()

    const count = await FinishedQuiz.countDocuments(match)

    return { items, count }
  },

  createFinishedQuiz: async (data, currentUser) => {
    const { quiz, grade, results, cooperation } = data

    const finishedQuiz = await FinishedQuiz.create({
      quiz,
      grade,
      results,
      cooperation
    })

    await cooperationService.updateCooperation(cooperation, currentUser, {
      finishedQuizzes: [finishedQuiz._id]
    })

    return finishedQuiz
  }
}

module.exports = finishedQuizService
