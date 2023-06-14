const Subject = require('~/models/subject')

const categoryNamesAggregateOptions = () => {
  return [
    {
      $lookup: {
        from: Subject.collection.name,
        localField: '_id',
        foreignField: 'category',
        as: 'subjects'
      }
    },
    {
      $match: {
        subjects: { $exists: true, $ne: [] }
      }
    },
    {
      $project: {
        name: 1
      }
    }
  ]
}

module.exports = categoryNamesAggregateOptions
