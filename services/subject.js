const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { SUBJECT_NOT_FOUND, SUBJECT_ALREADY_EXISTS } = require('~/consts/errors')

const subjectService = {
<<<<<<< HEAD
  getSubjects: async ({ skip, limit, sort, filter }) => {
    const subjects = await Subject.find(filter).skip(skip).limit(limit).sort(sort).lean().exec()
=======
  getSubjects: async ({ skip, limit, searchFilter }) => {
    const subjects = await Subject.find(searchFilter).skip(skip).limit(limit).sort({ totalOffers: -1 }).lean().exec()
>>>>>>> d00ffe0 (added filtering)

    return subjects
  },

  getSubjectById: async (id) => {
    const subject = await Subject.findById(id).lean().exec()

    if (!subject) {
      throw createError(404, SUBJECT_NOT_FOUND)
    }

    return subject
  },

  addSubject: async (name, category) => {
    const duplicatedSubject = await Subject.findOne({ name }).lean().exec()

    if (duplicatedSubject) {
      throw createError(409, SUBJECT_ALREADY_EXISTS)
    }

    const newSubject = await Subject.create({ name, category })
    return newSubject
  },

  updateSubject: async (id, updateData) => {
    const subject = await Subject.findByIdAndUpdate(id, updateData).lean().exec()

    if (!subject) {
      throw createError(404, SUBJECT_NOT_FOUND)
    }
  },

  deleteSubject: async (id) => {
    const subject = await Subject.findByIdAndRemove(id).exec()

    if (!subject) {
      throw createError(404, SUBJECT_NOT_FOUND)
    }
  }
}

module.exports = subjectService
