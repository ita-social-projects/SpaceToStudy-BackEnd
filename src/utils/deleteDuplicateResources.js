const resourceModelMapping = require('~/utils/resourceModelMapping')

const deleteDuplicateResources = async (course) => {
  const resourceIdsMapping = extractDuplicateResourceIds(course)

  const deletePromises = Object.entries(resourceIdsMapping).map(([resourceType, ids]) => {
    return resourceModelMapping[resourceType].deleteMany({ _id: { $in: ids } }).exec()
  })

  await Promise.all(deletePromises)
}

const extractDuplicateResourceIds = (course) => {
  const resourceIdsMapping = {}

  course.sections.forEach((section) => {
    section.resources.forEach(({ resource }) => {
      const { _id, isDuplicate, resourceType } = resource

      if (!isDuplicate) return

      if (Array.isArray(resourceIdsMapping[resourceType])) {
        resourceIdsMapping[resourceType].push(_id)
      } else {
        resourceIdsMapping[resourceType] = [_id]
      }
    })
  })

  return resourceIdsMapping
}

module.exports = deleteDuplicateResources
