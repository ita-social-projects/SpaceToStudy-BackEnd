const Lesson = require('~/models/lesson')
const uploadService = require('~/services/upload')
const { createForbiddenError } = require('~/utils/errorsHelper')
const { ATTACHMENT } = require('~/consts/upload')

const lessonService = {
  createLesson: async (author, data) => {
    let { title, description, attachments } = data

    const fileUrls = await Promise.all(
      attachments.map(async (file) => await uploadService.uploadFile(file, ATTACHMENT))
    )

    return await Lesson.create({ author, title, description, attachments: fileUrls })
  },
  getLessons: async (match, sort, skip, limit) => {
    const items = await Lesson.find(match).sort(sort).skip(skip).limit(limit).exec()
    const count = await Lesson.countDocuments(match)

    return {
      count,
      items
    }
  },
  deleteLesson: async (id, currentUser) => {
    const { id: currentUserId } = currentUser

    const lesson = await Lesson.findById(id)

    const lessonAuthor = lesson.author.toString()

    if (lessonAuthor !== currentUserId) {
      throw createForbiddenError()
    }

    await Lesson.findByIdAndRemove(id).exec()
  }
}

module.exports = lessonService
