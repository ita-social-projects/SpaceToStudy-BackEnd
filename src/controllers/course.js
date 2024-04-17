const courseService = require('~/services/course')
const getMatchOptions = require('~/utils/getMatchOptions')
const getRegex = require('~/utils/getRegex')
const getSortOptions = require('~/utils/getSortOptions')

const getCourses = async (req, res) => {
  const { id: author } = req.user
  const { skip, limit, title, sort, category, subject, proficiencyLevel } = req.query

  const proficiencyLevelMatch = proficiencyLevel ? { $in: proficiencyLevel } : undefined
  const match = getMatchOptions({
    author,
    title: getRegex(title),
    category,
    subject,
    proficiencyLevel: proficiencyLevelMatch
  })

  const sortOptions = getSortOptions(sort)

  const course = await courseService.getCourses(match, parseInt(skip), parseInt(limit), sortOptions)

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
