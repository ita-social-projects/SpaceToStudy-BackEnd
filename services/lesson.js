const Lesson = require('~/models/lesson')
const uploadService = require('~/services/upload')
const { ATTACHMENT } = require('~/consts/upload')
const { createForbiddenError, createError } = require('~/utils/errorsHelper')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const lessonService = {
  createLesson: async (author, data) => {
    let { title, description, attachments } = data
    let fileUrls

    if (attachments) {
      fileUrls = await Promise.all(attachments.map(async (file) => await uploadService.uploadFile(file, ATTACHMENT)))
    }

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
      const urls = await Promise.all(
        attachments.map(async (file) => {
          return await uploadService.uploadFile(file, ATTACHMENT)
        })
      )

      if (rewriteAttachments) lesson.attachments = urls
      else lesson.attachments = lesson.attachments.concat(urls)
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
  }
}

module.exports = lessonService
