const resourceModelMapping = require('~/utils/resourceModelMapping')

const handleResources = async (resources) => {
  return await Promise.all(
    resources.map(async (resourceItem) => {
      const { resource, resourceType } = resourceItem
      const { _id, isDuplicate } = resource

      if (!isDuplicate) return resourceItem

      const removeMetadataFields = (resource) => {
        // eslint-disable-next-line no-unused-vars
        const { _id, createdAt, updatedAt, ...cleanedResource } = resource
        return cleanedResource
      }

      if (_id) {
        const existingResource = await resourceModelMapping[resourceType].findOne({
          _id,
          isDuplicate: true
        })

        if (existingResource) {
          return { ...resourceItem, resource: existingResource }
        }
      }

      const newResource = removeMetadataFields(resource)
      const createdResource = await resourceModelMapping[resourceType].create({ ...newResource, isDuplicate })

      return { ...resourceItem, resource: createdResource }
    })
  )
}

module.exports = handleResources
