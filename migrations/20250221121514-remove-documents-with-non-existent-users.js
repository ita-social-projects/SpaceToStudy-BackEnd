module.exports = {
  async up(db) {
    const allUsers = await db
      .collection('users')
      .find({}, { projection: { _id: 1 } })
      .toArray()
    const allUserIds = allUsers.map((user) => user._id.toString())
    const collections = ['attachments', 'courses', 'lessons', 'notes', 'questions', 'quizzes', 'resourcescategories']
    for (const collectionName of collections) {
      const authorsFromCollection = await db.collection(collectionName).distinct('author')
      const nonExistingUsers = await authorsFromCollection.filter((userId) => !allUserIds.includes(userId.toString()))

      if (nonExistingUsers.length > 0) {
        await db.collection(collectionName).deleteMany({ author: { $in: nonExistingUsers } })
      }
    }
  },

  async down() {}
}
