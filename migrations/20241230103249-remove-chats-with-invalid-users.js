module.exports = {
  async up(db) {
    const allUsers = await db
      .collection('users')
      .find({}, { projection: { _id: 1 } })
      .toArray()
    const validUserIds = allUsers.map((user) => user._id.toString())

    const chats = await db.collection('chats').find({}).toArray()

    for (const chat of chats) {
      const validMembers = chat.members.filter((member) => validUserIds.includes(member.user.toString()))

      if (validMembers.length !== 2) {
        await db.collection('chats').deleteOne({ _id: chat._id })
      }
    }
  },

  async down() {}
}
