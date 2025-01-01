module.exports = {
  async up(db) {
    const lessonsCollection = db.collection('lessons')

    await lessonsCollection.updateMany({ resourceType: 'lessons' }, { $set: { resourceType: 'lesson' } })

    await lessonsCollection.updateMany({ resourceType: { $exists: false } }, { $set: { resourceType: 'lesson' } })
  },

  async down(db) {
    const lessonsCollection = db.collection('lessons')

    await lessonsCollection.updateMany({ resourceType: 'lesson' }, { $set: { resourceType: 'lessons' } })
  }
}
