const courseService = require('~/services/course')

const getCourses = async (req, res) => {
  const { id: author } = req.user
  const { skip, limit } = req.query

  const course = await courseService.getCourses({ skip: parseInt(skip), limit: parseInt(limit), author })

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

const getCourseById = async (req, res) => {
  const { id } = req.params

  const course = await courseService.getCourseById(id)

  res.status(200).json(course)
}

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  getCourseById
}
