const roles = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
}

const tokenNames = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  RESET_TOKEN: 'resetToken',
  CONFIRM_TOKEN: 'confirmToken'
}

const oneDayInMs = 86400000
const thirtyDaysInMs = 30 * oneDayInMs
const ownerFields = ['initiator', 'receiver', 'author']

module.exports = {
  roles,
  ownerFields,
  oneDayInMs,
  thirtyDaysInMs,
  tokenNames
}
