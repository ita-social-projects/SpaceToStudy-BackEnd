const { Schema, model } = require('mongoose')
const {
  FIELD_CANNOT_BE_EMPTY,
  ENUM_CAN_BE_ONE_OF,
  FIELD_CANNOT_BE_LONGER,
  FIELD_CANNOT_BE_SHORTER,
  FIELD_MUST_BE_SELECTED
} = require('~/app/consts/errors')
const { USER, MESSAGE, CHAT } = require('~/app/consts/models')
const {
  enums: { MAIN_ROLE_ENUM }
} = require('~/app/consts/validation')
const { NEW } = require('~/app/consts/notificationTypes')
const Chat = require('~/app/models/chat')
const notificationService = require('~/app/services/notification')

const messageSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: USER,
      required: [true, FIELD_CANNOT_BE_EMPTY('author')]
    },
    authorRole: {
      type: String,
      enum: {
        values: MAIN_ROLE_ENUM,
        message: ENUM_CAN_BE_ONE_OF('author role', MAIN_ROLE_ENUM),
        required: [true, FIELD_MUST_BE_SELECTED('author role')]
      }
    },
    text: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('text')],
      minLength: [1, FIELD_CANNOT_BE_SHORTER('text', 1)],
      maxLength: [1000, FIELD_CANNOT_BE_LONGER('text', 1000)]
    },
    isRead: {
      type: Boolean,
      default: false,
      select: false
    },
    isNotified: {
      type: Boolean,
      default: true,
      select: false
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: CHAT,
      required: [true, FIELD_CANNOT_BE_EMPTY('chat')]
    },
    clearedFor: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: USER,
          required: true
        },
        _id: false
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
)

messageSchema.post('save', async function (doc) {
  const { _id, chat: chatId } = doc

  const chat = await Chat.findById(chatId).exec()

  chat.latestMessage = _id

  chat.members.map(async (member) => {
    if (doc.author.toString() !== member.user.toString()) {
      const notificationData = {
        user: member.user,
        userRole: member.role,
        type: NEW,
        reference: _id,
        referenceModel: MESSAGE
      }

      await notificationService.createNotification(notificationData)
    }
  })

  await chat.save()
})

messageSchema.post('deleteMany', async function (doc) {
  const { chat } = doc

  await Chat.updateOne({ _id: chat }, { latestMessage: null })
})

module.exports = model(MESSAGE, messageSchema)
