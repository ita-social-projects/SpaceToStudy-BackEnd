const Course = require('~/models/course')

const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const { createError, createForbiddenError } = require('~/utils/errorsHelper')

const courseService = {
  getCourses: async (match, skip, limit, sort) => {
    const items = await Course.find(match)
      .collation({ locale: 'en', strength: 1 })
      .populate([
        { path: 'subject', select: '_id name' },
        { path: 'category', select: 'appearance' }
      ])
      .sort({ updatedAt: sort })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    const count = await Course.countDocuments(match)

    return { items, count }
  },

  getCourseById: async (id) => {
    return await Course.findById(id)
      .populate([
        { path: 'sections.lessons', select: '_id title resourceType' },
        { path: 'sections.attachments', select: '_id fileName resourceType' },
        { path: 'sections.quizzes', select: '_id title resourceType' }
      ])
      .lean()
      .exec()
  },

  createCourse: async (author, data) => {
    const { title, description, category, subject, proficiencyLevel, sections } = data

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
    const { id, title, description, category, subject, proficiencyLevel, sections } = data

    const course = await Course.findById(id).exec()

    if (!course) {
      throw createError(DOCUMENT_NOT_FOUND(Course.modelName))
    }

    const courseAuthor = course.author.toString()

    if (userId !== courseAuthor) {
      throw createForbiddenError()
    }

    const updateData = { title, description, category, subject, proficiencyLevel, sections }

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
