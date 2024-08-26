const resourceModelMapping = require('~/utils/resourceModelMapping')

const handleResources = async (resources) => {
  return await Promise.all(
    resources.map(async (resourceItem) => {
      const { resource, resourceType, isDuplicate } = resourceItem
      let newResource = resource

      if (isDuplicate) {
        const existingResource = await resourceModelMapping[resourceType].findOne({
          _id: resource._id,
          isDuplicate: true
        })

        delete resource._id
        delete resource.createdAt
        delete resource.updatedAt
        newResource =
          existingResource || (await resourceModelMapping[resourceType].create({ ...resource, isDuplicate }))
      }

      return { ...resourceItem, resource: newResource }
    })
  )
}

module.exports = handleResources
