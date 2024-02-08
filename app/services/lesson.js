const Lesson = require('~/app/models/lesson')

const { createForbiddenError, createError } = require('~/app/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/app/consts/errors')

const lessonService = {
  createLesson: async (author, data) => {
    const { title, description, attachments, content, category } = data

    return await Lesson.create({ author, title, description, attachments, content, category })
  },

  getLessons: async (match, sort, skip, limit) => {
    const items = await Lesson.find(match)
      .collation({ locale: 'en', strength: 1 })
      .populate({ path: 'category', select: '_id name' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec()
    const count = await Lesson.countDocuments(match)

    return {
      count,
      items
    }
  },

  updateLesson: async (id, currentUser, updateData) => {
    const lesson = await Lesson.findById(id).exec()

    if (!lesson) {
      throw createError(404, DOCUMENT_NOT_FOUND(Lesson.modelName))
    }

    const author = lesson.author.toString()

    if (currentUser !== author) {
      throw createForbiddenError()
    }

    for (const field in updateData) {
      lesson[field] = updateData[field]
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
    return await Lesson.findById(id).populate('attachments').lean().exec()
  }
}

module.exports = lessonService
