module.exports = {
  async up(db) {
    const existingOffers = await db
      .collection('offers')
      .find({}, { projection: { _id: 1 } })
      .toArray()
    const existingOfferIds = existingOffers.map((o) => o._id)

    await db.collection('cooperation').deleteMany({
      $or: [{ offer: { $exists: false } }, { offer: null }, { offer: { $nin: existingOfferIds } }]
    })
  },

  async down() {}
}
