const Student = require('~/models/student')
const { createError } = require('~/utils/errorsHelper')
const { hashPassword } = require('~/utils/passwordHelper')
const { USER_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')

const studentService = {
  createStudent: async (role, firstName, lastName, email, password, language) => {
    const duplicateStudent = await studentService.getStudentByEmail(email)

    if (duplicateStudent) {
      throw createError(409, ALREADY_REGISTERED)
    }

    const hashedPassword = await hashPassword(password)

    const newStudent = await Student.create({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      language
    })

    return newStudent
  },

  getStudents: async () => {
    const students = await Student.find().lean().exec()

    return students
  },

  getStudentById: async (id) => {
    const student = await Student.findById(id).lean().exec()

    if (!student) {
      throw createError(404, USER_NOT_FOUND)
    }

    return student
  },

  getStudentByEmail: async (email) => {
    const student = await Student.findOne({ email }).select('+password').lean().exec()

    if (!student) {
      return null
    }

    return student
  },

  updateStudent: async (id, updateData) => {
    const student = await Student.findByIdAndUpdate(id, updateData, { new: true }).lean().exec()

    if (!student) {
      throw createError(404, USER_NOT_FOUND)
    }
  },

  deleteStudent: async (id) => {
    const student = await Student.findByIdAndRemove(id).exec()

    if (!student) {
      throw createError(404, USER_NOT_FOUND)
    }
  }
}

module.exports = studentService
