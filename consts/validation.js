const lengths = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 25,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 30
}

const regex = {
  EMAIL_PATTERN: /^([a-z\d]+([._-][a-z\d]+)*)@([a-z\d]+([.-][a-z\d]+)*\.[a-z]{2,})$/i,
  PASSWORD_PATTERN: /^(?=.*\d)(?=.*[a-zа-яєії])\S+$/i,
  NAME_PATTERN: /^[a-zа-яєії]+$/i
}

const enums = {
  ROLE_ENUM: ['student', 'tutor'],
  LANG_ENUM: ['en', 'ua'],
  LANG_LEVEL_ENUM: ['Beginner', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Native'],
  ADMIN_STATUS_ENUM: ['active', 'blocked', 'pending']
}

module.exports = {
  lengths,
  regex,
  enums
}
