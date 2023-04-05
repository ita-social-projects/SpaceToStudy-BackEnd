const mongoose = require('mongoose')

const condition = (data) => {
  const condition = {}

  if (data.catid) {
    condition.categoryId = mongoose.Types.ObjectId(data.catid)
  }

  if (data.subid) {
    condition.subjectId = mongoose.Types.ObjectId(data.subid)
  }

  if (data.authorRole) {
    condition.authorRole = data.authorRole
  }

  return condition
}

module.exports = {
  condition
}
