module.exports = {
  async up(db) {
    const existingSubjectDocs = await db
      .collection('subjects')
      .find({}, { projection: { _id: 1 } })
      .toArray()
    const existingSubjectIds = existingSubjectDocs.map((doc) => doc._id)

    await db.collection('offers').deleteMany({
      $or: [{ subject: { $exists: false } }, { subject: null }, { subject: { $nin: existingSubjectIds } }]
    })
  },

  async down() {}
}
