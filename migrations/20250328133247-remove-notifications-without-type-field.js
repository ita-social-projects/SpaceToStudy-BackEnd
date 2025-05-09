module.exports = {
  async up(db) {
    await db.collection('notifications').deleteMany({ type: { $exists: false } })
  },

  async down() {}
}
