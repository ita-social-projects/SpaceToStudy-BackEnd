const Tutor = require('~/models/tutor')
const { hashPassword } = require('~/utils/passwordHelper')
const { createError } = require('~/utils/errorsHelper')

// const { USER_NOT_FOUND, ALREADY_REGISTERED, FORBIDDEN, INCORRECT_CREDENTIALS } = require('~/consts/errors')
const { USER_NOT_FOUND } = require('~/consts/errors')

const tutorService = {
  createTutor: async (role, firstName, lastName, email, password, language) => {
    // const duplicateUser = await userService.getUserByEmail(email)

    // if (duplicateUser) {
    //   throw createError(409, ALREADY_REGISTERED)
    // }
    const hashedPassword = await hashPassword(password)

    const newTutor = await Tutor.create({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      language
    })

    return newTutor
  },

  getTutors: async () => {
    const tutors = await Tutor.find().lean().exec()

    return tutors
  },

  getTutorById: async (id) => {
    const tutor = await Tutor.findById(id).lean().exec()

    if (!tutor) {
      throw createError(404, USER_NOT_FOUND)
    }

    return tutor
  },

  getTutorByEmail: async (email) => {
    const tutor = await Tutor.findOne({ email }).lean().exec()

    if (!tutor) {
      return null
    }

    tutor.role = tutor.role.value

    return tutor
  },

  updateTutor: async (id, updateData) => {
    const tutor = await Tutor.findByIdAndUpdate(id, updateData, { new: true }).exec()

    if (!tutor) {
      throw createError(404, USER_NOT_FOUND)
    }
  },

  deleteTutor: async (id) => {
    const tutor = await Tutor.findByIdAndRemove(id).exec()

    if (!tutor) {
      throw createError(404, USER_NOT_FOUND)
    }
  }
}

module.exports = tutorService
