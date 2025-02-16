module.exports = {
  async up(db) {
    await db.collection('cooperation').updateMany({ needAction: { $type: 'string' } }, [
      {
        $set: {
          needAction: {
            role: '$needAction',
            type: {
              $cond: {
                if: { $eq: ['$status', 'request to close'] },
                then: 'waiting for approval',
                else: 'price'
              }
            },
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
