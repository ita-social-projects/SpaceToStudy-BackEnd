const subjectService = require('~/services/subject')

const getSubjects = async (req, res) => {
  const subjects = await subjectService.getSubjects()

  res.status(200).json(subjects)
}
const getSubjectById = async (req, res) => {
  const { id } = req.params

  const subject = await subjectService.getSubjectById(id)

  res.status(200).json(subject)
}
const addSubject = async (req, res) => {
  const tutorId = req.params.id
  const { name, price, proficiencyLevel, category } = req.body

  const newSubject = await subjectService.addSubject(tutorId, name, price, proficiencyLevel, category)

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
