const Question = require('~/models/question')
const { createForbiddenError } = require('~/utils/errorsHelper')

const questionService = {
  getQuestions: async (match, sort, skip = 0, limit = 10) => {
    const items = await Question.find(match)
      .collation({ locale: 'en', strength: 1 })
      .populate({ path: 'category', select: '_id name' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
    const count = await Question.countDocuments(match)

    return { items, count }
  },

  getQuestionById: async (id) => {
    return await Question.findById(id).lean().exec()
  },

  createQuestion: async (author, data) => {
    const { title, text, answers, type, category } = data

    const question = await Question.create({
      title,
      text,
      answers,
      type,
      category,
      author
    })

    return await question.populate({ path: 'category', select: '_id name' })
  },

  deleteQuestion: async (id, currentUser) => {
    const question = await Question.findById(id).exec()

    const author = question.author.toString()

    if (author !== currentUser) {
      throw createForbiddenError()
    }

    await Question.findByIdAndRemove(id).exec()
  },

  updateQuestion: async (id, currentUserId, data) => {
    const question = await Question.findById(id).exec()

    const author = question.author.toString()

    if (author !== currentUserId) {
      throw createForbiddenError()
    }

    for (let field in data) {
      question[field] = data[field]
    }

    await question.save()
    return question.populate({ path: 'category', select: '_id name' })
  }
}

module.exports = questionService
