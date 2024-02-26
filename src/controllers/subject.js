const subjectService = require('~/services/subject')
const getRegex = require('~/utils/getRegex')
const getMatchOptions = require('~/utils/getMatchOptions')

const getSubjects = async (req, res) => {
  const { id: category } = req.params
  const { skip, limit, name } = req.query

  const searchFilter = { name: getRegex(name), ...(category && { category }) }

  const subjects = await subjectService.getSubjects({ skip: parseInt(skip), limit: parseInt(limit), searchFilter })

  res.status(200).json(subjects)
}

const getSubjectById = async (req, res) => {
  const { id } = req.params

  const subject = await subjectService.getSubjectById(id)

  res.status(200).json(subject)
}

const getNamesByCategoryId = async (req, res) => {
  const { id: category } = req.params

  const match = getMatchOptions({ category })

  const names = await subjectService.getNamesByCategoryId(match)

  res.status(200).json(names)
}

const addSubject = async (req, res) => {
  const data = req.body

  const newSubject = await subjectService.addSubject(data)

  res.status(201).json(newSubject)
}

const updateSubject = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  await subjectService.updateSubject(id, updateData)

  res.status(204).end()
}

const deleteSubject = async (req, res) => {
  const { id } = req.params

  await subjectService.deleteSubject(id)

  res.status(204).end()
}

module.exports = {
  getSubjects,
  getSubjectById,
  getNamesByCategoryId,
  addSubject,
  updateSubject,
  deleteSubject
}
