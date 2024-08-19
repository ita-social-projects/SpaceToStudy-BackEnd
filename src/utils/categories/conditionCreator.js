const mongoose = require('mongoose')

const condition = (data) => {
  const condition = {}

  if (data.categoryId) {
    condition.category = new mongoose.Types.ObjectId(data.categoryId)
  }

  if (data.subjectId) {
    condition.subject = new mongoose.Types.ObjectId(data.subjectId)
  }

  if (data.authorRole) {
    condition.authorRole = data.authorRole
  }

  return condition
}

module.exports = {
  condition
}
