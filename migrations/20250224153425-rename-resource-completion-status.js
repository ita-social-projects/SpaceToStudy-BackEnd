const COLLECTION_NAME = 'cooperation'
const COMPLETION_STATUS = {
  ACTIVE: 'active',
  IN_PROGRESS: 'in progress'
}
const NOT_EMPTY_SECTIONS_FILTER = {
  sections: { $ne: [] }
}

module.exports = {
  async up(db) {
    await db.collection(COLLECTION_NAME).updateMany(
      NOT_EMPTY_SECTIONS_FILTER,
      {
        $set: {
          'sections.$[].resources.$[resource].completionStatus': COMPLETION_STATUS.IN_PROGRESS
        }
      },
      {
        arrayFilters: [
          {
            $or: [
              { 'resource.completionStatus': COMPLETION_STATUS.ACTIVE },
              { 'resource.completionStatus': { $exists: false } }
            ]
          }
        ]
      }
    )
  },

  async down(db) {
    await db.collection(COLLECTION_NAME).updateMany(
      NOT_EMPTY_SECTIONS_FILTER,
      {
        $set: {
          'sections.$[].resources.$[resource].completionStatus': COMPLETION_STATUS.ACTIVE
        }
      },
      {
        arrayFilters: [
          {
            'resource.completionStatus': COMPLETION_STATUS.IN_PROGRESS
          }
        ]
      }
    )
  }
}
