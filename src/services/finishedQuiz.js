const FinishedQuiz = require('~/models/finishedQuiz')
const Quiz = require('~/models/quiz')

const { createError } = require('~/utils/errorsHelper')

const { QUIZ_TIME_LIMIT_EXCEEDED } = require('~/consts/errors')
const {
  roles: { STUDENT }
} = require('~/consts/auth')

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

  getFinishedQuizByQuizId: async (quizId, cooperationId) => {
    return await FinishedQuiz.find({ quiz: quizId, cooperation: cooperationId })
  },

  getFinishedQuizById: async (id) => {
    return await FinishedQuiz.findById(id).lean().exec()
  },

  updateFinishedQuiz: async (id, updateData, role) => {
    const finishedQuiz = await FinishedQuiz.findById(id).exec()
    const quiz = await Quiz.findById(finishedQuiz.quiz).exec()

    const timeLimitRaw = quiz.settings.timeLimit
    let timeLimit = parseInt(timeLimitRaw)

    if (!isNaN(timeLimit)) {
      timeLimit = timeLimit === 1 ? 60 * 60 * 1000 : timeLimit * 60 * 1000
    }

    const createdAt = new Date(finishedQuiz.createdAt).getTime()
    if (role === STUDENT && !isNaN(timeLimit) && createdAt + timeLimit < Date.now()) {
      throw createError(403, QUIZ_TIME_LIMIT_EXCEEDED)
    }

    for (let field in updateData) {
      finishedQuiz[field] = updateData[field]
    }

    await finishedQuiz.save()
  }
}

module.exports = finishedQuizService
