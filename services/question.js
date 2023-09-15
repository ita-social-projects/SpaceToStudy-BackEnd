const Question = require('~/models/question')
const { createForbiddenError } = require('~/utils/errorsHelper')

const questionService = {
  getQuestions: async (match, sort, skip = 0, limit = 10) => {
    const items = await Question.find(match)
      .collation({ locale: 'en', strength: 1 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
    const count = await Question.countDocuments(match)

    return { items, count }
  },

  createQuestion: async (author, data) => {
    const { title, answers, type } = data

    return await Question.create({
      title,
      answers,
      type,
      author
    })
  },

  deleteQuestion: async (id, currentUser) => {
    const question = await Question.findById(id).exec()

    const author = question.author.toString()

    if (author !== currentUser) {
      throw createForbiddenError()
    }

    await Question.findByIdAndRemove(id).exec()
  }
}
module.exports = questionService
