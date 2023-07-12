const Course = require('~/models/course')
const uploadService = require('~/services/upload')

const { ATTACHMENT } = require('~/consts/upload')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const { createError } = require('~/utils/errorsHelper')
const { createForbiddenError } = require('~/utils/errorsHelper')

const courseService = {
  getCourses: async ({ author, skip, limit }) => {
    const items = await Course.find({ author }).skip(skip).limit(limit).sort({ updatedAt: -1 }).lean().exec()
    const count = await Course.countDocuments({ author })

    return { items, count }
  },

  createCourse: async (author, data) => {
    const { title, description, lessons, attachments } = data
    let attachmentUrls

    if (attachments) {
      attachmentUrls = await Promise.all(
        attachments.map(async (file) => {
          return await uploadService.uploadFile(file, ATTACHMENT)
        })
      )
    }

    return await Course.create({
      title,
      description,
      author,
      lessons,
      attachments: attachmentUrls
    })
  },

  updateCourse: async (userId, data) => {
    const { id, title, description, attachments, rewriteAttachments = false } = data

    const course = await Course.findById(id).exec()

    if (!course) {
      throw createError(DOCUMENT_NOT_FOUND(Course.modelName))
    }

    const courseAuthor = course.author.toString()

    if (userId !== courseAuthor) {
      throw createForbiddenError()
    }

    if (attachments?.length) {
      const urls = await Promise.all(
        attachments.map(async (file) => {
          return await uploadService.uploadFile(file, ATTACHMENT)
        })
      )

      if (rewriteAttachments) course.attachments = urls
      else course.attachments = course.attachments.concat(urls)
    }

    const updateData = { title, description }

    for (const key in updateData) {
      const value = updateData[key]
      if (value) course[key] = value
    }

    await course.validate()
    await course.save()
  }
}

module.exports = courseService
