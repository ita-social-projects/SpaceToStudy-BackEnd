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

  const result = await lessonService.getLessons(match, sort, parseInt(skip), parseInt(limit))

  res.status(200).json(result)
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
  deleteLesson
}
