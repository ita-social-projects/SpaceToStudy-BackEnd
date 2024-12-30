module.exports = {
  async up(db) {
    const allUsers = await db
      .collection('users')
      .find({}, { projection: { _id: 1 } })
      .toArray()
    const allUserIds = allUsers.map((user) => user._id.toString())

    const chats = await db.collection('chats').find({}).toArray()

    for (const chat of chats) {
      const invalidMembers = chat.members.filter((member) => !allUserIds.includes(member.user.toString()))

      if (invalidMembers.length > 0) {
        await db.collection('chats').deleteOne({ _id: chat._id })
      }
    }
  },

  async down() {}
}
