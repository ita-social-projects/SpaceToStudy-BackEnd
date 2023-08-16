const Quiz = require('~/models/quiz')
const { createForbiddenError } = require('~/utils/errorsHelper')

const quizService = {
  getQuiz: async (match, sort, skip = 0, limit = 10) => {
    const items = await Quiz.find(match).skip(skip).limit(limit).sort(sort).lean().exec()
    const count = await Quiz.countDocuments(match)

    return { items, count }
  },

  createQuiz: async (author, data) => {
    const { title, items } = data

    return await Quiz.create({
      title,
      author,
      items
    })
  },

  deleteQuiz: async (id, currentUserId) => {
    const quiz = await Quiz.findById(id)
    const author = quiz.author.toString()

    if (author !== currentUserId) {
      throw createForbiddenError()
    }

    await Quiz.findByIdAndRemove(id).exec()
  }
}

module.exports = quizService
