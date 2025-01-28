module.exports = {
  async up(db) {
    const lessonsCollection = db.collection('lessons')

    await lessonsCollection.updateMany({}, { $unset: { availability: '' } })
  },

  async down(_db) {}
}
