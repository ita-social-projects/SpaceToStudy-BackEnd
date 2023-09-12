const Lesson = require('~/models/lesson')

const { createForbiddenError, createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const lessonService = {
  createLesson: async (author, data) => {
    const { title, description, attachments, category } = data

    return await Lesson.create({ author, title, description, attachments, category })
  },

  getLessons: async (match, sort, skip, limit) => {
    const items = await Lesson.find(match).sort(sort).skip(skip).limit(limit).exec()
    const count = await Lesson.countDocuments(match)

    return {
      count,
      items
    }
  },

  updateLesson: async (id, currentUser, updateData) => {
    const { title, description, attachments, rewriteAttachments = false } = updateData

    const lesson = await Lesson.findById(id).exec()

    if (!lesson) {
      throw createError(404, DOCUMENT_NOT_FOUND(Lesson.modelName))
    }

    const author = lesson.author.toString()

    if (currentUser !== author) {
      throw createForbiddenError()
    }

    if (attachments) {
      lesson.attachments = rewriteAttachments ? attachments : lesson.attachments.concat(attachments)
    }

    for (const [key, value] of Object.entries({ title, description })) {
      if (value) lesson[key] = value
    }

    await lesson.validate()
    await lesson.save()
  },

  deleteLesson: async (id, currentUser) => {
    const { id: currentUserId } = currentUser

    const lesson = await Lesson.findById(id)

    const lessonAuthor = lesson.author.toString()

    if (lessonAuthor !== currentUserId) {
      throw createForbiddenError()
    }

    await Lesson.findByIdAndRemove(id).exec()
  },

  getLessonById: async (id) => {
    return await Lesson.findById(id).lean().exec()
  }
}

module.exports = lessonService
