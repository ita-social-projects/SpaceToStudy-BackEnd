const Quiz = require('~/models/quiz')

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
  }
}

module.exports = quizService
