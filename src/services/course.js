const Course = require('~/models/course')

const { createForbiddenError } = require('~/utils/errorsHelper')
const handleResources = require('~/utils/handleResources')
const deleteDuplicateResources = require('~/utils/deleteDuplicateResources')

const courseService = {
  getCourses: async (match, skip, limit, sort) => {
    const items = await Course.find(match)
      .collation({ locale: 'en', strength: 1 })
      .populate([
        { path: 'subject', select: '_id name' },
        { path: 'category', select: 'appearance' },
        { path: 'sections.resources.resource', select: '-createdAt -updatedAt' }
      ])
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    const count = await Course.countDocuments(match)

    return { items, count }
  },

  getCourseById: async (id) => {
    return await Course.findById(id).populate('sections.resources.resource').lean().exec()
  },

  createCourse: async (author, data) => {
    const { title, description, category, subject, proficiencyLevel, sections } = data

    const updatedSections = await Promise.all(
      sections.map(async (section) => ({
        ...section,
        resources: await handleResources(section.resources)
      }))
    )

    return await Course.create({
      title,
      description,
      author,
      category,
      subject,
      proficiencyLevel,
      sections: updatedSections
    })
  },

  updateCourse: async (userId, data) => {
    const { id, title, description, category, subject, proficiencyLevel, sections } = data
    const course = await Course.findById(id).exec()

    const courseAuthor = course.author.toString()

    if (userId !== courseAuthor) {
      throw createForbiddenError()
    }

    if (sections) {
      course.sections = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          resources: await handleResources(section.resources)
        }))
      )

      course.markModified('sections')

      await course.validate()
      await course.save()
    }

    const updateData = {
      title,
      description,
      category,
      subject,
      proficiencyLevel
    }

    for (const key in updateData) {
      const value = updateData[key]
      if (value) course[key] = value
    }

    await course.validate()
    await course.save()
  },

  deleteCourse: async (id, currentUser) => {
    const course = await Course.findById(id)
      .populate([{ path: 'sections.resources.resource', select: '_id isDuplicate resourceType' }])
      .exec()

    const author = course.author.toString()

    if (author !== currentUser) {
      throw createForbiddenError()
    }

    await deleteDuplicateResources(course)

    await Course.findByIdAndRemove(id).exec()
  },

  deleteCoursesByAuthor: async (author) => {
    await Course.deleteMany({ author })
  }
}

module.exports = courseService
