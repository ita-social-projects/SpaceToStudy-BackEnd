const courseService = require('~/app/services/course')
const getMatchOptions = require('~/app/utils/getMatchOptions')
const getRegex = require('~/app/utils/getRegex')

const getCourses = async (req, res) => {
  const { id: author } = req.user
  const { skip, limit, title, sort } = req.query

  const match = getMatchOptions({
    author,
    title: getRegex(title),
  })

  const course = await courseService.getCourses(match, parseInt(skip), parseInt(limit), sort)

  res.status(200).json(course)
}

const getCourseById = async (req, res) => {
  const { id } = req.params

  const course = await courseService.getCourseById(id)

  res.status(200).json(course)
}

const createCourse = async (req, res) => {
  const { id: author } = req.user
  const data = req.body

  const newCourse = await courseService.createCourse(author, data)

  res.status(201).json(newCourse)
}

const updateCourse = async (req, res) => {
  const { id: userId } = req.user
  const { id } = req.params
  const data = req.body

  await courseService.updateCourse(userId, { ...data, id })

  res.status(204).end()
}

const deleteCourse = async (req, res) => {
  const { id: currentUser } = req.user
  const { id } = req.params

  await courseService.deleteCourse(id, currentUser)

  res.status(204).end()
}

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  getCourseById,
  deleteCourse
}
