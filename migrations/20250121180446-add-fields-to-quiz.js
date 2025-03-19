module.exports = {
  async up(db) {
    await db.collection('quizzes').updateMany(
      {},
      {
        $set: {
          'settings.timeLimit': 'No limit',
          'settings.attemptLimit': 'No limit'
        }
      }
    )
  },

  async down(db) {
    await db.collection('quizzes').updateMany(
      {},
      {
        $unset: {
          'settings.timeLimit': '',
          'settings.attemptLimit': ''
        }
      }
    )
  }
}
