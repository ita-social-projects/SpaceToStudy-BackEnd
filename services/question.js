const Question = require('~/models/question')

const questionService = {
  getQuestions: async (match, sort, skip = 0, limit = 10) => {
    const items = await Question
      .find(match)
      .collation({ locale: 'en', strength: 1 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
    const count = await Question.countDocuments(match)

    return { items, count }
  }
}

module.exports = questionService
