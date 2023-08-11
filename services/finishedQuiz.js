const FinishedQuiz = require('~/models/finishedQuiz')

const finishedQuizService = {
  getFinishedQuizzes: async (skip = 0, limit = 10) => {
    const items = await FinishedQuiz.find().skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec()
    const count = await FinishedQuiz.countDocuments()

    return { items, count }
  }
}

module.exports = finishedQuizService
