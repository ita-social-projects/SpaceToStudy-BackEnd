const FinishedQuiz = require('~/models/finishedQuiz')
const Quiz = require('~/models/quiz')
const cooperationService = require('~/services/cooperation')
const quizService = require('~/services/quiz')
const { createError } = require('~/utils/errorsHelper')
const { QUIZ_ATTEMPT_LIMIT_EXCEEDED } = require('~/consts/errors')

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

    const finishedQuizzes = await finishedQuizService.getFinishedQuizByQuizId(quiz)

    const quizCollection = await quizService.getQuizById(quiz)
    const attemptLimit = parseInt(quizCollection.settings.attemptLimit)

    if (!isNaN(attemptLimit) && finishedQuizzes.length >= attemptLimit) {
      throw createError(403, QUIZ_ATTEMPT_LIMIT_EXCEEDED)
    }

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
  },

  getFinishedQuizByQuizId: async (quizId) => {
    return await FinishedQuiz.find({ quiz: quizId }).lean().exec()
  },

  getFinishedQuizById: async (id) => {
    return await FinishedQuiz.findById(id).lean().exec()
  }
}

module.exports = finishedQuizService
