const lessonService = require('~/services/lesson')
const getMatchOptions = require('~/utils/getMatchOptions')

const createLesson = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newLesson = await lessonService.createLesson(author, data)

  res.status(201).json(newLesson)
}

const getLessons = async (req, res) => {
  const { id: author } = req.user
  const { title, sort, skip, limit } = req.query

  const match = getMatchOptions({ author, title })

  const lessons = await lessonService.getLessons(match, sort, parseInt(skip), parseInt(limit))

  res.status(200).json(lessons)
}

const updateLesson = async (req, res) => {
  const { id: currentUser } = req.user
  const { id } = req.params
  const updateData = req.body

  await lessonService.updateLesson(id, currentUser, updateData)

  res.status(204).end()
}

const deleteLesson = async (req, res) => {
  const { id } = req.params
  const currentUser = req.user

  await lessonService.deleteLesson(id, currentUser)

  res.status(204).end()
}

module.exports = {
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson
}
