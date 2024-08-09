const Course = require('~/models/course')

const { createForbiddenError } = require('~/utils/errorsHelper')
const resourceModelMapping = require('~/utils/resourceModelMapping')

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
        resources: await Promise.all(
          section.resources.map(async (resourceItem) => {
            const { resource, resourceType, isDuplicate } = resourceItem
            let newResource = resource

            if (isDuplicate) {
              delete resource._id
              newResource = await resourceModelMapping[resourceType].create({ ...resource, isDuplicate })
            }

            return { ...resourceItem, resource: newResource }
          })
        )
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
      const updatedSections = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          resources: await Promise.all(
            section.resources.map(async (resourceItem) => {
              const { resource, resourceType, isDuplicate } = resourceItem
              let newResource = resource

              if (isDuplicate) {
                const founded = await resourceModelMapping[resourceType].findOne({
                  _id: resource._id,
                  isDuplicate: true
                })

                delete resource._id
                newResource = founded || (await resourceModelMapping[resourceType].create({ ...resource, isDuplicate }))
              }

              return { ...resourceItem, resource: newResource }
            })
          )
        }))
      )

      course.sections = updatedSections

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
    const course = await Course.findById(id).exec()

    const author = course.author.toString()

    if (author !== currentUser) {
      throw createForbiddenError()
    }

    await Course.findByIdAndRemove(id).exec()
  }
}

module.exports = courseService
