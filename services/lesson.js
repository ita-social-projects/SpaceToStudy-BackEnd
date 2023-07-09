const Lesson = require('~/models/lesson')
const uploadService = require('~/services/upload')
const { ATTACHMENT } = require('~/consts/upload')

const lessonService = {
  createLesson: async (author, data) => {
    let { title, description, attachments } = data

    const fileUrls = await Promise.all(
      attachments.map(async (file) => await uploadService.uploadFile(file, ATTACHMENT))
    )

    return await Lesson.create({ author, title, description, attachments: fileUrls })
  },

  deleteLesson: async (id) => {
    await Lesson.findByIdAndRemove(id).exec()
  }
}

module.exports = lessonService
