const mongoose = require('mongoose')
const Course = require('~/models/course')
const resourceModelMapping = require('~/utils/resourceModelMapping')

const deleteCourseTransaction = async (course) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const resourceIdsMapping = {}

    course.sections.forEach((section) => {
      section.resources.forEach(({ resource }) => {
        const { _id, isDuplicate, resourceType } = resource

        if (!isDuplicate) {
          return
        }

        if (Array.isArray(resourceIdsMapping[resourceType])) {
          resourceIdsMapping[resourceType].push(_id)
        } else {
          resourceIdsMapping[resourceType] = [_id]
        }
      })
    })

    for (const key in resourceIdsMapping) {
      if (resourceIdsMapping[key].length)
        await resourceModelMapping[key].deleteMany({ _id: { $in: resourceIdsMapping[key] } }, { session }).exec()
    }

    await Course.findByIdAndRemove(course.id, { session }).exec()

    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

module.exports = deleteCourseTransaction
