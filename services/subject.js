const Subject = require('~/models/subject')
const capitalizeFirstLetter = require('~/utils/capitalizeFirstLetter')

const subjectService = {
  getSubjects: async ({ skip, limit, searchFilter }) => {
    return await Subject.find(searchFilter).skip(skip).limit(limit).sort({ totalOffers: -1 }).lean().exec()
  },

  getSubjectById: async (id) => {
    return await Subject.findById(id).lean().exec()
  },

  getNamesByCategoryId: async (match) => {
    return await Subject.find(match).select('name').lean().exec()
  },

  addSubject: async (data) => {
    let { name, category } = data

    name = capitalizeFirstLetter(name)

    return await Subject.create({ name, category })
  },

  updateSubject: async (id, updateData) => {
    if ('name' in updateData) {
      updateData.name = capitalizeFirstLetter(updateData.name)
    }

    await Subject.findByIdAndUpdate(id, updateData).lean().exec()
  },

  deleteSubject: async (id) => {
    await Subject.findByIdAndRemove(id).exec()
  }
}

module.exports = subjectService
