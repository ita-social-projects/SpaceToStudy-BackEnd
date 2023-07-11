const lessonService = require('~/services/lesson')

const createLesson = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newLesson = await lessonService.createLesson(author, data)

  res.status(201).json(newLesson)
}

const deleteLesson = async (req, res) => {
  const { id } = req.params
  const currentUser = req.user

  await lessonService.deleteLesson(id, currentUser)

  res.status(204).end()
}

module.exports = {
  createLesson,
  deleteLesson
}
