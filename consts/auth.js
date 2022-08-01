const roles = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  ADMIN: 'admin'
}

const tokenNames = {
  REFRESH_TOKEN: 'refreshToken',
  RESET_TOKEN: 'resetToken',
}

const oneDayInMs = 86400000

module.exports = {
  roles,
  oneDayInMs,
  tokenNames,
}
