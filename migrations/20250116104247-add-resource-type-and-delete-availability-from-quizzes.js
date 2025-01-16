module.exports = {
  async up(db) {
    const quizzesCollection = db.collection('quizzes')
    await quizzesCollection.updateMany({ availability: { $exists: true } }, { $unset: { availability: '' } })
    await quizzesCollection.updateMany(
      {
        $or: [{ resourceType: { $exists: false } }, { resourceType: 'quizzes' }]
      },
      { $set: { resourceType: 'quiz' } }
    )
  },

  async down(db) {
    const quizzesCollection = db.collection('quizzes')
    await quizzesCollection.updateMany(
      { availability: { $exists: false } },
      {
        $set: {
          availability: {
            status: 'open',
            date: null
          }
        }
      }
    )
    await quizzesCollection.updateMany({ resourceType: 'quiz' }, { $set: { resourceType: 'quizzes' } })
  }
}
