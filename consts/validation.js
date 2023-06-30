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
  APP_LANG_ENUM: ['en', 'ua'],
  SPOKEN_LANG_ENUM: ['English', 'Ukrainian', 'Polish', 'German', 'French', 'Spanish', 'Arabic'],
  PROFICIENCY_LEVEL_ENUM: ['Beginner', 'Intermediate', 'Advanced', 'Test Preparation', 'Professional', 'Specialized'],
  ROLE_ENUM: ['student', 'tutor', 'admin', 'superadmin'],
  LOGIN_ROLE_ENUM: ['student', 'tutor', 'admin'],
  MAIN_ROLE_ENUM: ['student', 'tutor'],
  STATUS_ENUM: ['active', 'blocked'],
  COOPERATION_STATUS_ENUM: ['pending', 'active', 'declined', 'closed'],
  PARAMS_ENUM: ['id', 'categoryId', 'subjectId'],
  OFFER_STATUS_ENUM: ['active', 'draft', 'closed'],
  NOTIFICATION_TYPE_ENUM: ['review', 'comment']
}

module.exports = {
  lengths,
  regex,
  enums
}
