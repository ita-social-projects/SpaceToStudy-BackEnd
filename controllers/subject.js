const subjectService = require('~/services/subject')
const createAggregateOptions = require('~/utils/users/createAggregateOptions')

const getSubjects = async (req, res) => {
  const { skip, limit, sort, match } = createAggregateOptions(req.query)
  
  const filter = match ? { name: { $regex: match } } : {}

  const subjects = await subjectService.getSubjects({ skip, limit, sort, match:filter })

  res.status(200).json(subjects)
}
const getSubjectById = async (req, res) => {
  const { id } = req.params

  const subject = await subjectService.getSubjectById(id)

  res.status(200).json(subject)
}
const addSubject = async (req, res) => {
  const { name, category } = req.body

  const newSubject = await subjectService.addSubject(name, category)

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
  addSubject,
  updateSubject,
  deleteSubject
}
