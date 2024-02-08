const Note = require('~/app/models/note')
const Cooperation = require('~/app/models/cooperation')
const { createForbiddenError, createError } = require('~/app/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/app/consts/errors')

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
      $or: [
        { isPrivate: false },
        { $and: [{ author: userId }, { isPrivate: true }] }
      ]
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

    if (!note) throw createError(404, DOCUMENT_NOT_FOUND(note.modelName))

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
  }
}

module.exports = noteService
