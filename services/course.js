const Course = require('~/models/course')

const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError, createForbiddenError } = require('~/utils/errorsHelper')

const courseService = {
  getCourses: async ({ author, skip, limit }) => {
    const items = await Course.find({ author }).skip(skip).limit(limit).sort({ updatedAt: -1 }).lean().exec()
    const count = await Course.countDocuments({ author })

    return { items, count }
  },

  getCourseById: async (id) => {
    return await Course.findById(id).lean().exec()
  },

  createCourse: async (author, data) => {
    const {
      title,
      description,
      category,
      subject,
      proficiencyLevel,
      sections
    } = data

    return await Course.create({
      title,
      description,
      author,
      category,
      subject,
      proficiencyLevel,
      sections
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

    if (attachments) {
      course.attachments = rewriteAttachments ? attachments : course.attachments.concat(attachments)
    }

    const updateData = { title, description }

    for (const key in updateData) {
      const value = updateData[key]
      if (value) course[key] = value
    }

    await course.validate()
    await course.save()
  },

  deleteCourse: async (id, currentUser) => {
    const course = await Course.findById(id).exec()

    if (!course) {
      throw createError(DOCUMENT_NOT_FOUND(Course.modelName))
    }

    const author = course.author.toString()

    if (author !== currentUser) {
      throw createForbiddenError()
    }

    await Course.findByIdAndRemove(id).exec()
  }
}

module.exports = courseService
