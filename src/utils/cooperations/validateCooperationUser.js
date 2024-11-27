const { createForbiddenError } = require('~/utils/errorsHelper')

const validateCooperationUser = (cooperation, userId) => {
  const initiator = cooperation.initiator.toString()
  const receiver = cooperation.receiver.toString()

  if (initiator !== userId && receiver !== userId) {
    throw createForbiddenError()
  }
}

module.exports = validateCooperationUser
