const Quiz = require('~/models/quiz')

const quizService = {
  getQuiz: async (match, sort, skip = 0, limit = 10) => {
    const items = await Quiz.find(match).skip(skip).limit(limit).sort(sort).lean().exec()
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
  }
}

module.exports = quizService
