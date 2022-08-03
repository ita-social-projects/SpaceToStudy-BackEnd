const lengths = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 25
}

const regex = {
  EMAIL_PATTERN: /^([a-z\d]+([._-][a-z\d]+)*)@([a-z\d]+([.-][a-z\d]+)*\.[a-z]{2,})$/i,
  PASSWORD_PATTERN: /^(?=.*\d)(?=.*[a-zа-яєії])(?=.*[_\-~\/#$@!%&*?])([a-zа-яєії0-9_\-~\/#$@!%&*?]+)$/i,
  NAME_PATTERN: /^[a-zа-яєії]+$/i
}

const enums = {
  ROLE_ENUM: ['student', 'mentor']
}

module.exports = {
  lengths,
  regex,
  enums
}
