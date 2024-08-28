const { Schema, model } = require('mongoose')

const resourceTypeMapping = require('~/utils/resourceTypeMapping')

const {
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_EMPTY,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_CANNOT_BE_LONGER
} = require('~/consts/errors')

const { COURSE, USER, CATEGORY, SUBJECT } = require('~/consts/models')

const {
  enums: { PROFICIENCY_LEVEL_ENUM, RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('title')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
      maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
    },
    description: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('description')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('description', 1)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('description', 1000)]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY,
      default: null
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: SUBJECT,
      required: [true, FIELD_CANNOT_BE_EMPTY('subject')]
    },
    proficiencyLevel: {
      type: [String],
      enum: {
        values: PROFICIENCY_LEVEL_ENUM,
        message: ENUM_CAN_BE_ONE_OF('proficiency level', PROFICIENCY_LEVEL_ENUM)
      },
      required: [true, FIELD_CANNOT_BE_EMPTY('proficiency level')]
    },
    sections: [
      {
        title: {
          type: String,
          required: [true, FIELD_CANNOT_BE_EMPTY('title')],
          minLength: [1, FIELD_CANNOT_BE_SHORTER('title', 1)],
          maxLength: [100, FIELD_CANNOT_BE_LONGER('title', 100)]
        },
        description: {
          type: String,
          minLength: [1, FIELD_CANNOT_BE_SHORTER('description', 1)],
          maxLength: [150, FIELD_CANNOT_BE_LONGER('description', 150)],
          trim: true
        },
        resources: [
          {
            _id: false,
            resource: {
              type: Schema.Types.ObjectId,
              required: true,
              ref: (doc) => resourceTypeMapping[doc.resourceType]
            },
            resourceType: {
              type: String,
              required: true,
              enum: {
                values: RESOURCES_TYPES_ENUM,
                message: ENUM_CAN_BE_ONE_OF('resource type', RESOURCES_TYPES_ENUM)
              }
            }
          }
        ]
      }
    ]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

module.exports = model(COURSE, courseSchema)
