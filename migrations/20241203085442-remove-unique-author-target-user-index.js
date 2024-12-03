const collectionName = 'reviews'

const indexName = 'author_1_targetUserId_1'

module.exports = {
  async up(db) {
    await db.collection(collectionName).dropIndex(indexName)
  },

  async down(db) {
    await db.collection(collectionName).createIndex({ author: 1, targetUserId: 1 }, { unique: true })
  }
}
