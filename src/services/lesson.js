const Lesson = require('~/models/lesson')
const { createForbiddenError } = require('~/utils/errorsHelper')
const resourceType = require('~/consts/resourceType')

const cooperationService = require('./cooperation')

const lessonService = {
  createLesson: async (author, data) => {
    const { title, description, attachments, content, category, isDuplicate } = data

    return await Lesson.create({ author, title, description, attachments, content, category, isDuplicate })
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

    await cooperationService.removeResourceFromCooperations(id, resourceType.LESSON, currentUserId)

    await Lesson.findByIdAndRemove(id).exec()
  },

  getLessonById: async (id) => {
    return await Lesson.findById(id).populate('attachments').lean().exec()
  },

  deleteLessonsByAuthor: async (author) => {
    await Lesson.deleteMany({ author })
  }
}

module.exports = lessonService
