const studentService = require('~/services/student')

const getStudents = async (_req, res) => {
  const students = await studentService.getStudents()

  res.status(200).json(students)
}

const getStudentById = async (req, res) => {
  const { id } = req.params

  const student = await studentService.getStudentById(id)

  res.status(200).json(student)
}

const updateStudent = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  const student = await studentService.updateStudent(id, updateData)

  res.status(200).json(student)
}

const deleteStudent = async (req, res) => {
  const { id } = req.params

  await studentService.deleteStudent(id)

  res.status(204).end()
}

module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
}
