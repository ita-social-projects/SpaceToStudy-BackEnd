const mongoose = require('mongoose')

const condition = (data) => {
  const condition = {}

  if (data.categoryId) {
    condition.category = new mongoose.Types.ObjectId(`${data.categoryId}`).toString()
  }

  if (data.subjectId) {
    condition.subject = new mongoose.Types.ObjectId(`${data.subjectId}`).toString()
  }

  if (data.authorRole) {
    condition.authorRole = data.authorRole
  }

  return condition
}

module.exports = {
  condition
}
