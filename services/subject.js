const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { SUBJECT_NOT_FOUND } = require('~/consts/errors')

const subjectService = {
  getSubjects: async () => {
    const subjects = await Subject.find().lean().exec()

    return subjects
  },

  getSubjectById: async (id) => {
    const subject = await Subject.findById(id).lean().exec()

    if (!subject) {
      throw createError(404, SUBJECT_NOT_FOUND)
    }

    return subject
  },

  addSubject: async (tutorId, name, price, proficiencyLevel, category) => {
    const newSubject = await Subject.create({ tutorId, name, price, proficiencyLevel, category })

    return newSubject
  },

  updateSubject: async (id, updateData) => {
    const subject = await Subject.findByIdAndUpdate(id, updateData).lean().exec()

    if (!subject) {
      throw createError(404, SUBJECT_NOT_FOUND)
    }
  },

  deleteSubject: async (id) => {
    const subject = Subject.findByIdAndRemove(id).exec()

    if (!subject) {
      throw createError(404, SUBJECT_NOT_FOUND)
    }
  }
}

module.exports = subjectService
