const CollectionName = {
  OFFERS: 'offers',
  COOPERATION: 'cooperation',
  USERS: 'users'
}

const AUTHOR_FIELD = 'author'

module.exports = {
  async up(db) {
    const offersWithoutValidAuthors = await db
      .collection(CollectionName.OFFERS)
      .aggregate([
        {
          $lookup: {
            from: CollectionName.USERS,
            localField: AUTHOR_FIELD,
            foreignField: '_id',
            as: 'authorDetails'
          }
        },
        { $match: { authorDetails: { $eq: [] } } },
        { $project: { _id: true } }
      ])
      .toArray()

    const invalidAuthorOfferIds = offersWithoutValidAuthors.map((offer) => offer._id)

    await db.collection(CollectionName.COOPERATION).deleteMany({ offer: { $in: invalidAuthorOfferIds } })
    await db.collection(CollectionName.OFFERS).deleteMany({ _id: { $in: invalidAuthorOfferIds } })
  },

  down() {}
}
