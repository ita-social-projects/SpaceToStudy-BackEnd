const restrictedOperations = [
  'create',
  'update',
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findByIdAndUpdate',
  'findByIdAndReplace',
  'insertOne',
  'insertMany',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
  'findOneAndRemove',
  'findByIdAndDelete',
  'findByIdAndRemove',
  'remove',
  'save',
  'bulkWrite'
]

module.exports = { restrictedOperations }
