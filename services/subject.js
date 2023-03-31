const Subject = require('~/models/subject')
const { createError } = require('~/utils/errorsHelper')
const { SUBJECT_ALREADY_EXISTS } = require('~/consts/errors')

const subjectService = {
  getSubjects: async ({ skip, limit, searchFilter }) => {
    const subjects = await Subject.find(searchFilter).skip(skip).limit(limit).sort({ totalOffers: -1 }).lean().exec()

    return subjects
  },

  getSubjectById: async (id) => {
    const subject = await Subject.findById(id).lean().exec()

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
    await Subject.findByIdAndUpdate(id, updateData).lean().exec()
  },

  deleteSubject: async (id) => {
    await Subject.findByIdAndRemove(id).exec()
  }
}

module.exports = subjectService
