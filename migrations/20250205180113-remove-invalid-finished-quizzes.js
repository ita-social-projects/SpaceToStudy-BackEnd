const { mapToId } = require('../src/utils/mapToId')

module.exports = {
  async up(db) {
    const collection = db.collection('finishedquizzes')

    const invalidFinishedQuizzes = await collection.find({ cooperation: { $exists: false } }).toArray()

    await collection.deleteMany({ _id: { $in: mapToId(invalidFinishedQuizzes) } })
  },

  async down() {}
}
