const lessonService = require('~/app/services/lesson')
const getCategoriesOptions = require('~/app/utils/getCategoriesOption')
const getMatchOptions = require('~/app/utils/getMatchOptions')
const getRegex = require('~/app/utils/getRegex')
const getSortOptions = require('~/app/utils/getSortOptions')

const createLesson = async (req, res) => {
  const { id: author } = req.user

  const data = req.body

  const newLesson = await lessonService.createLesson(author, data)

  res.status(201).json(newLesson)
}
const getLessonById = async (req, res) => {
  const { id } = req.params

  const lesson = await lessonService.getLessonById(id)

  res.status(200).json(lesson)
}

const getLessons = async (req, res) => {
  const { id: author } = req.user
  const { title, sort, skip, limit, categories } = req.query

  const categoriesOptions = getCategoriesOptions(categories)
  const match = getMatchOptions({ author, title: getRegex(title), category: categoriesOptions })
  const sortOptions = getSortOptions(sort)

  const lessons = await lessonService.getLessons(match, sortOptions, parseInt(skip), parseInt(limit))

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
  deleteLesson,
  getLessonById
}
