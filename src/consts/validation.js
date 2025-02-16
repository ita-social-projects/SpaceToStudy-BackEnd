const lengths = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 25,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 30,
  MIN_PROFFESSIONAL_SUMMARY_LENGTH: 1,
  MAX_PROFFESSIONAL_SUMMARY_LENGTH: 200,
  MAX_PROFESSIONAL_BLOCK_FIELD_LENGTH: 1000,
  MAX_ABOUT_STUDENT_FIELD_LENGTH: 1000
}

const regex = {
  EMAIL_PATTERN: /^([a-z\d]+([._-][a-z\d]+)*)@([a-z\d]+([.-][a-z\d]+)*\.[a-z]{2,})$/i,
  PASSWORD_PATTERN: /^(?=.*\d)(?=.*[a-zа-яєії])\S+$/i,
  NAME_PATTERN: /^[a-zа-яєії' -]+$/i,
  VIDEOLINK_PATTERN: /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be|youtube\.com)/
}

const enums = {
  APP_LANG_ENUM: ['en', 'uk'],
  APP_LANG_DEFAULT: 'en',
  SPOKEN_LANG_ENUM: ['English', 'Ukrainian', 'Polish', 'German', 'French', 'Spanish', 'Arabic'],
  PROFICIENCY_LEVEL_ENUM: ['Beginner', 'Intermediate', 'Advanced', 'Test Preparation', 'Professional', 'Specialized'],
  ROLE_ENUM: ['student', 'tutor', 'admin', 'superadmin'],
  LOGIN_ROLE_ENUM: ['student', 'tutor', 'admin', 'superadmin'],
  MAIN_ROLE_ENUM: ['student', 'tutor'],
  STATUS_ENUM: ['active', 'blocked', 'deactivated'],
  COOPERATION_STATUS_ENUM: ['pending', 'active', 'declined', 'closed', 'request to close'],
  NEED_ACTION_ENUM: ['waiting for approval', 'waiting for answer', 'price'],
  PARAMS_ENUM: ['id', 'categoryId', 'subjectId'],
  OFFER_STATUS_ENUM: ['active', 'draft', 'closed'],
  NOTIFICATION_TYPE_ENUM: [
    'new',
    'requested',
    'active',
    'declined',
    'updated',
    'closed',
    'deleted',
    'request to close'
  ],
  QUESTION_TYPE_ENUM: ['multipleChoice', 'openAnswer', 'oneAnswer'],
  QUIZ_VIEW_ENUM: ['Stepper', 'Scroll'],
  QUIZ_TIME_LIMIT: ['No limit', '15 minutes', '30 minutes', '45 minutes', '1 hour'],
  QUIZ_ATTEMPT_LIMIT: ['No limit', '1 attempt', '2 attempts', '3 attempts', '5 attempts', '10 attempts'],
  QUIZ_SETTINGS_ENUM: ['view', 'shuffle', 'pointValues', 'scoredResponses', 'correctAnswers'],
  RESOURCE_STATUS_ENUM: ['available', 'finished'],
  RESOURCE_AVAILABILITY_STATUS_ENUM: ['open', 'closed', 'openFrom'],
  RESOURCE_COMPLETION_STATUS_ENUM: ['active', 'completed'],
  RESOURCES_TYPES_ENUM: ['lesson', 'quiz', 'attachment', 'question']
}

module.exports = {
  lengths,
  regex,
  enums
}
