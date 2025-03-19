const Quiz = require('~/models/quiz')
const { createForbiddenError } = require('~/utils/errorsHelper')
const resourceType = require('~/consts/resourceType')

const cooperationService = require('./cooperation')

const quizService = {
  getQuiz: async (match, sort, skip = 0, limit = 10) => {
    const items = await Quiz.find(match)
      .collation({ locale: 'en', strength: 1 })
      .populate({ path: 'category', select: '_id name' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
    const count = await Quiz.countDocuments(match)

    return { items, count }
  },

  getQuizById: async (id) => {
    return await Quiz.findById(id).populate({ path: 'items', select: 'title answers text type' }).lean().exec()
  },

  createQuiz: async (author, data) => {
    const { title, category, items, description, settings, isDuplicate } = data

    return await Quiz.create({
      title,
      author,
      category,
      settings,
      items,
      description,
      isDuplicate
    })
  },

  updateQuiz: async (id, currentUserId, updateData) => {
    const quiz = await Quiz.findById(id).exec()

    const author = quiz.author.toString()
    if (currentUserId !== author) {
      throw createForbiddenError()
    }

    const { settings } = updateData

    for (let field in updateData) {
      if (field === 'settings') {
        Object.assign(quiz.settings, settings)
      } else {
        quiz[field] = updateData[field]
      }
    }

    await quiz.save()
  },

  deleteQuiz: async (id, currentUserId) => {
    const quiz = await Quiz.findById(id)

    const quizAuthor = quiz.author.toString()

    if (quizAuthor !== currentUserId) {
      throw createForbiddenError()
    }

    await cooperationService.removeResourceFromCooperations(id, resourceType.QUIZ, currentUserId)

    await Quiz.findByIdAndRemove(id).exec()
  },

  deleteQuizzesByAuthor: async (author) => {
    await Quiz.deleteMany({ author })
  }
}

module.exports = quizService
