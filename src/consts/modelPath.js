const Cooperation = require('~/models/cooperation')

const MODEL_CONFIGS = {
  CooperationModel: {
    model: Cooperation,
    ownerFields: ['author', 'initiator', 'receiver'],
    dynamicPaths: {
      sectionsResources: 'sections.resources',
      resourceField: 'resource',
      userFields: ['initiator', 'receiver'],
      availabilityField: 'availability.status'
    }
  }
}

module.exports = { MODEL_CONFIGS }
