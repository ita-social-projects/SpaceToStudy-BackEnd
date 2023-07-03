const Lesson = require('~/models/lesson')
const uploadService = require('~/services/upload')
const { LESSON } = require('~/consts/upload')

const lessonService = {
  createLesson: async (data) => {
    let { author, title, description, attachments } = data

    const fileUrls = attachments.map(async (file) => {
      const fileUrl = await uploadService.uploadFile(file, LESSON)
      return fileUrl
    })

    return await Lesson.create({ author, title, description, attachments: fileUrls })
  }
}

module.exports = lessonService
