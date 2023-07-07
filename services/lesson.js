const Lesson = require('~/models/lesson')
const uploadService = require('~/services/upload')
const { LESSON } = require('~/consts/upload')

const lessonService = {
  createLesson: async (author, data) => {
    let { title, description, attachments } = data

    const fileUrls = await Promise.all(attachments.map(async (file) => await uploadService.uploadFile(file, LESSON)))

    return await Lesson.create({ author, title, description, attachments: fileUrls })
  }
}

module.exports = lessonService
