const { CATEGORY, SUBJECT } = require('~/consts/models')

const { Schema } = require('mongoose')

const UserSubject = {
  type: Schema.Types.ObjectId,
  ref: SUBJECT
}

const UserMainSubject = {
  category: {
    type: Schema.Types.ObjectId,
    ref: CATEGORY
  },
  subjects: [UserSubject]
}

module.exports = {
  UserMainSubject,
  UserSubject
}
