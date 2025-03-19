const Note = require('~/models/note')
const Cooperation = require('~/models/cooperation')
const { createForbiddenError } = require('~/utils/errorsHelper')

const noteService = {
  addNote: async (data, author, cooperation) => {
    const { text, isPrivate } = data

    const foundedCooperation = await Cooperation.findOne({
      $and: [{ _id: cooperation }, { $or: [{ receiver: author }, { initiator: author }] }]
    }).exec()

    if (!foundedCooperation) throw createForbiddenError()

    return await Note.create({ text, author, isPrivate, cooperation })
  },

  getNotes: async (cooperation, userId) => {
    const foundedCooperation = await Cooperation.findOne({
      $and: [{ _id: cooperation }, { $or: [{ receiver: userId }, { initiator: userId }] }]
    }).exec()

    if (!foundedCooperation) throw createForbiddenError()

    return await Note.find({
      cooperation,
      $or: [{ isPrivate: false }, { $and: [{ author: userId }, { isPrivate: true }] }]
    })
      .populate({
        path: 'author',
        select: ['firstName', 'lastName', 'photo']
      })
      .sort({ createdAt: -1 })
      .exec()
  },

  updateNote: async (updateData, cooperation, userId, noteId) => {
    const foundedCooperation = await Cooperation.findOne({
      $and: [{ _id: cooperation }, { $or: [{ receiver: userId }, { initiator: userId }] }]
    }).exec()

    if (!foundedCooperation) throw createForbiddenError()

    const note = await Note.findById(noteId).exec()
    if (!note || note.author.toString() !== userId) throw createForbiddenError()

    for (const field in updateData) {
      note[field] = updateData[field]
    }

    await note.validate()
    await note.save()
  },

  deleteNote: async (cooperation, userId, noteId) => {
    const foundedCooperation = await Cooperation.findOne({
      $and: [{ _id: cooperation }, { $or: [{ receiver: userId }, { initiator: userId }] }]
    }).exec()

    if (!foundedCooperation) throw createForbiddenError()

    const note = await Note.findById(noteId).exec()

    if (!note || note.author.toString() !== userId) throw createForbiddenError()

    await Note.findByIdAndRemove(noteId).exec()
  },

  deleteNotesByAuthor: async (author) => {
    await Note.deleteMany({ author })
  },

  deleteNotesByCooperations: async (cooperations) => {
    await Note.deleteMany({ cooperation: { $in: cooperations } })
  }
}

module.exports = noteService
