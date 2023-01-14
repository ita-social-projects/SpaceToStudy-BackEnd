const {
  roles: { TUTOR, STUDENT }
} = require('~/consts/auth')

const choseLastUsedRole = (tutor, student) => {
  let user

  if (tutor && student) {
    if (tutor.lastLogin && student.lastLogin) {
      user = tutor.lastLogin > student.lastLogin ? tutor : student
    } else if (tutor.lastLogin || student.lastLogin) {
      user = tutor.lastLogin ? tutor : student
    } else if (!tutor.lastLogin && !student.lastLogin) {
      user = tutor.createdAt > student.createdAt ? tutor : student
    }
  } else {
    user = tutor || student
  }
  return user
}

const choseServiceByRole = (role, tutorService, studentService) => {
  if (role === TUTOR) {
    return tutorService
  }
  if (role === STUDENT) {
    return studentService
  }
}

module.exports = {
  choseLastUsedRole,
  choseServiceByRole
}
