const mongoose = require('mongoose')

const condition = (data) => {
  const condition = {}

  if (data.categoryId) {
    condition.category = mongoose.Types.ObjectId.createFromHexString(data.categoryId)
  }

  if (data.subjectId) {
    condition.subject = mongoose.Types.ObjectId.createFromHexString(data.subjectId)
  }

  if (data.authorRole) {
    condition.authorRole = data.authorRole
  }

  return condition
}

module.exports = {
  condition
}
