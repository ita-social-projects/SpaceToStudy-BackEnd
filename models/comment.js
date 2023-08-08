const { Schema, model } = require('mongoose')
const { FIELD_CANNOT_BE_EMPTY, FIELD_CANNOT_BE_SHORTER, ENUM_CAN_BE_ONE_OF } = require('~/consts/errors')
const { COOPERATION, COMMENT, USER } = require('~/consts/models')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/consts/validation')
const { NEW } = require('~/consts/notificationTypes')
const cooperationService = require('~/services/cooperation')
const notificationService = require('~/services/notification')

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('text')],
      minLength: [4, FIELD_CANNOT_BE_SHORTER('text', 4)]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    authorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', MAIN_ROLE_ENUM)
      },
      required: [true, 'Author role must be selected.']
    },
    cooperation: {
      type: Schema.Types.ObjectId,
      ref: COOPERATION,
      required: [true, FIELD_CANNOT_BE_EMPTY('cooperation')]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

commentSchema.post('save', async function () {
  const cooperation = await cooperationService.getCooperationById(this.cooperation)

  const user =
    this.author.toString() === cooperation.initiator.toString() ? cooperation.receiver : cooperation.initiator
  const notificationData = {
    user,
    userRole: user === cooperation.initiator ? cooperation.initiatorRole : cooperation.receiverRole,
    type: NEW,
    reference: this._id,
    referenceModel: COMMENT
  }

  await notificationService.createNotification(notificationData)
})

module.exports = model(COMMENT, commentSchema)
