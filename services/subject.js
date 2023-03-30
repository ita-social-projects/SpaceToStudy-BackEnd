const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND, SUBJECT_ALREADY_EXISTS } = require('~/consts/errors')

const subjectService = {
  getSubjects: async ({ skip, limit, searchFilter }) => {
    const subjects = await Subject.find(searchFilter).skip(skip).limit(limit).sort({ totalOffers: -1 }).lean().exec()

    return subjects
  },

  getSubjectById: async (id) => {
    const subject = await Subject.findById(id).lean().exec()

    if (!subject) {
      throw createError(404, DOCUMENT_NOT_FOUND(Subject.modelName))
    }

    return subject
  },

  getNamesByCategoryId: async (category) => {
    return await Subject.find({ category }).select('name').lean().exec()
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
      throw createError(404, DOCUMENT_NOT_FOUND(Subject.modelName))
    }
  },

  deleteSubject: async (id) => {
    const subject = await Subject.findByIdAndRemove(id).exec()

    if (!subject) {
      throw createError(404, DOCUMENT_NOT_FOUND(Subject.modelName))
    }
  }
}

module.exports = subjectService
