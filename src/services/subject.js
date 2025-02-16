const Subject = require('~/models/subject')
const capitalizeFirstLetter = require('~/utils/capitalizeFirstLetter')
const recountOfferAmount = require('~/utils/offers/recountOfferAmount')

const subjectService = {
  getSubjects: async ({ skip, limit, searchFilter }) => {
    const subjects = await Subject.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'category', select: 'appearance' })
      .sort({ totalOffers: -1, updatedAt: -1, _id: 1 })
      .lean()
      .exec()

    const count = await Subject.countDocuments(searchFilter)
    return { count, items: subjects }
  },

  getSubjectById: async (id) => {
    return await Subject.findById(id).lean().exec()
  },

  getNamesByCategoryId: async (match) => {
    return await Subject.find(match).select('name').lean().exec()
  },

  addSubject: async (data) => {
    let { name, category } = data

    if (name[0] === name[0].toLowerCase()) {
      name = capitalizeFirstLetter(name)
    }

    return await Subject.create({ name, category })
  },

  updateSubject: async (id, updateData) => {
    if ('name' in updateData && updateData.name[0] === updateData.name[0].toLowerCase()) {
      updateData.name = capitalizeFirstLetter(updateData.name)
    }

    await Subject.findByIdAndUpdate(id, updateData).lean().exec()
  },

  deleteSubject: async (id) => {
    await Subject.findByIdAndRemove(id).exec()
  },

  recountTotalOffers: async () => {
    const subjects = await Subject.aggregate(recountOfferAmount('subject'))
    const subjectBulkOps = subjects.map(({ _id, totalOffers }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { totalOffers } }
      }
    }))
    await Subject.bulkWrite(subjectBulkOps)
  }
}

module.exports = subjectService
