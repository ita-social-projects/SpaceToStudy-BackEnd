const { mapToId } = require('../src/utils/mapToId')

module.exports = {
  async up(db) {
    const allOffers = await db.collection('offers').find({}, { _id: true }).toArray()
    const offerIds = mapToId(allOffers)

    const allUsers = await db.collection('users').find({}, { _id: true }).toArray()
    const userIds = mapToId(allUsers)

    const invalidCooperations = await db
      .collection('cooperation')
      .find({
        $or: [{ initiator: { $nin: userIds } }, { receiver: { $nin: userIds } }, { offer: { $nin: offerIds } }]
      })
      .toArray()

    if (invalidCooperations.length > 0) {
      await db.collection('cooperation').deleteMany({ _id: { $in: mapToId(invalidCooperations) } })
    }
  },

  async down() {}
}
