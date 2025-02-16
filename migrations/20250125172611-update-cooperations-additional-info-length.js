const { mapToId } = require('../src/utils/mapToId')

module.exports = {
  async up(db) {
    const additionalText = ' //additionalInfo needs to be greater or equal 30'
    const invalidCooperations = await db
      .collection('cooperation')
      .find({
        $and: [{ additionalInfo: { $exists: true } }, { $expr: { $lt: [{ $strLenCP: '$additionalInfo' }, 30] } }]
      })
      .toArray()

    if (invalidCooperations.length > 0) {
      await db.collection('cooperation').updateMany({ _id: { $in: mapToId(invalidCooperations) } }, [
        {
          $set: {
            additionalInfo: {
              $concat: ['$additionalInfo', additionalText]
            }
          }
        }
      ])
    }
  },

  async down() {}
}
