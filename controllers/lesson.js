const lessonService = require('~/services/lesson')

const createLesson = async (req, res) => {
  const currentUser = req.user
  const data = req.body

  const newLesson = await lessonService.createLesson(currentUser, data)

  res.status(201).json(newLesson)
}

module.exports = {
  createLesson
}
