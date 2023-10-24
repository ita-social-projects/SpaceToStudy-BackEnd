const Quiz = require('~/models/quiz')
const { createForbiddenError } = require('~/utils/errorsHelper')

const quizService = {
  getQuiz: async (match, sort, skip = 0, limit = 10) => {
    const items = await Quiz.find(match)
      .collation({ locale: 'en', strength: 1 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
    const count = await Quiz.countDocuments(match)

    return { items, count }
  },

  getQuizById: async (id) => {
    return await Quiz.findById(id).lean().exec()
  },

  createQuiz: async (author, data) => {
    const { title, category, items } = data

    return await Quiz.create({
      title,
      author,
      category,
      items
    })
  },

  updateQuiz: async (id, currentUserId, updateData) => {
    const quiz = await Quiz.findById(id).exec()

    const author = quiz.author.toString()
    if (currentUserId !== author) {
      throw createForbiddenError()
    }

    for (let field in updateData) {
      quiz[field] = updateData[field]
    }

    await quiz.save()
  },
  deleteQuiz: async (id, currentUserId) => {
    const quiz = await Quiz.findById(id)

    const quizAuthor = quiz.author.toString()

    if (quizAuthor !== currentUserId) {
      throw createForbiddenError()
    }

    await Quiz.findByIdAndRemove(id).exec()
  }
}

module.exports = quizService
