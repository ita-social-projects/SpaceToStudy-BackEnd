const FinishedQuiz = require('~/models/finishedQuiz')
const Quiz = require('~/models/quiz')

const { createForbiddenError } = require('~/utils/errorsHelper')

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
  },

  getFinishedQuizById: async (id) => {
    return await FinishedQuiz.findById(id).lean().exec()
  },

  updateFinishedQuiz: async (id, currentUserId, updateData) => {
    const finishedQuiz = await FinishedQuiz.findById(id).exec()

    const author = finishedQuiz.author.toString()
    if (currentUserId !== author) {
      throw createForbiddenError()
    }

    for (let field in updateData) {
      finishedQuiz[field] = updateData[field]
    }

    await finishedQuiz.save()
  }
}

module.exports = finishedQuizService
