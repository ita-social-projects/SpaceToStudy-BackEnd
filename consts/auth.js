const roles = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
}

const tokenNames = {
  REFRESH_TOKEN: 'refreshToken',
  RESET_TOKEN: 'resetToken',
  CONFIRM_TOKEN: 'confirmToken'
}

const oneDayInMs = 86400000

module.exports = {
  roles,
  oneDayInMs,
  tokenNames
}
