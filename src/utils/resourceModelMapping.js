const Lesson = require('~/models/lesson')
const Quiz = require('~/models/quiz')
const Attachment = require('~/models/attachment')
const Question = require('~/models/question')
const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

const resourceModelMapping = {
  [RESOURCES_TYPES_ENUM[0]]: Lesson,
  [RESOURCES_TYPES_ENUM[1]]: Quiz,
  [RESOURCES_TYPES_ENUM[2]]: Attachment,
  [RESOURCES_TYPES_ENUM[3]]: Question
}

module.exports = resourceModelMapping
