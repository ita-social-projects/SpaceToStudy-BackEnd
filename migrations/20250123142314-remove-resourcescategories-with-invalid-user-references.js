const { mapToId } = require('../src/utils/mapToId')

module.exports = {
  async up(db) {
    const allUsers = await db.collection('users').find({}).toArray()
    const userIds = mapToId(allUsers)
    const invalidResourcesCategories = await db
      .collection('resourcescategories')
      .find({ author: { $nin: userIds } })
      .toArray()

    if (invalidResourcesCategories.length > 0) {
      await db.collection('resourcescategories').deleteMany({ _id: { $in: mapToId(invalidResourcesCategories) } })
    }
  },

  async down() {}
}
