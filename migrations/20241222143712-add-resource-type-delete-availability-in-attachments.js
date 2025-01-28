module.exports = {
  async up(db) {
    const attachmentsCollection = db.collection('attachments')
    await attachmentsCollection.updateMany({ availability: { $exists: true } }, { $unset: { availability: '' } })
    await attachmentsCollection.updateMany(
      { resourceType: { $exists: false } },
      { $set: { resourceType: 'attachment' } }
    )

    await attachmentsCollection.updateMany({ resourceType: 'attachments' }, { $set: { resourceType: 'attachment' } })
  },

  async down(db) {
    const attachmentsCollection = db.collection('attachments')
    await attachmentsCollection.updateMany(
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
    await attachmentsCollection.updateMany(
      { resourceType: { $exists: true } },
      { $unset: { resourceType: 'attachments' } }
    )
  }
}
