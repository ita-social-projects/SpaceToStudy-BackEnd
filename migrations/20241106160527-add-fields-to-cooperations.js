module.exports = {
  async up(db) {
    await db
      .collection('cooperation')
      .aggregate([
        {
          $lookup: {
            from: 'offers',
            localField: 'offer',
            foreignField: '_id',
            as: '_tmp_offers_array'
          }
        },
        { $set: { _tmp_offer: { $first: '$_tmp_offers_array' } } },
        {
          $set: {
            subject: '$_tmp_offer.subject',
            category: '$_tmp_offer.category',
            description: '$_tmp_offer.description',
            languages: '$_tmp_offer.languages',
            proficiencyLevel: '$_tmp_offer.proficiencyLevel'
          }
        },
        {
          $project: {
            subject: 1,
            category: 1,
            description: 1,
            languages: 1,
            proficiencyLevel: 1
          }
        },
        { $merge: { into: 'cooperation', on: '_id' } }
      ])
      .toArray()
  },

  async down(db) {
    await db.collection('cooperation').updateMany({}, [
      {
        $unset: ['subject', 'category', 'description', 'languages']
      },
      {
        $set: { proficiencyLevel: { $first: '$proficiencyLevel' } }
      }
    ])
  }
}
