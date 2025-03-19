module.exports = {
  async up(db) {
    const users = await db
      .collection('users')
      .find({}, { projection: { _id: true } })
      .toArray()

    const userIds = users.map((user) => user._id.toString())

    const notifications = await db.collection('notifications').find({}).toArray()

    for (const notification of notifications) {
      if (!userIds.includes(notification.user.toString())) {
        await db.collection('notifications').deleteOne({ _id: notification._id })
      }
    }
  },

  async down() {}
}
