module.exports = {
  async up(db) {
    await db.collection('cooperation').updateMany({ needAction: { $type: 'string' } }, [
      {
        $set: {
          needAction: {
            role: '$needAction',
            type: 'price',
            messages: []
          }
        }
      }
    ])
  },

  async down(db) {
    await db
      .collection('cooperation')
      .updateMany({ 'needAction.role': { $exists: true } }, [{ $set: { needAction: '$needAction.role' } }])
  }
}
