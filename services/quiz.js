const Quiz = require('~/models/quiz')

const quizService = {
  getQuiz: async (match, skip, limit) => {
    const items = await Quiz.find(match).skip(skip).limit(limit).sort({ updatedAt: -1 }).lean().exec()
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
