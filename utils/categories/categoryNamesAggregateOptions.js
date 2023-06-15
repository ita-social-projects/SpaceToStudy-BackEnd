const categoryNamesAggregateOptions = () => {
  return [
    {
      $lookup: {
        from: 'subjects',
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
