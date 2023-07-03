const Lesson = require('~/models/lesson')
const uploadService = require('~/services/upload')
const { createForbiddenError } = require('~/utils/errorsHelper')
const { LESSON } = require('~/consts/upload')

const lessonService = {
  createLesson: async (currentUser, data) => {
    let { title, description, attachments } = data

    const { id: author, role } = currentUser

    if (role !== 'tutor') {
      throw createForbiddenError()
    }

    const fileUrls = await Promise.all(
      attachments.map(async (file) => {
        const fileUrl = await uploadService.uploadFile(file, LESSON)
        return fileUrl
      })
    )

    return await Lesson.create({ author, title, description, attachments: fileUrls })
  }
}

module.exports = lessonService
