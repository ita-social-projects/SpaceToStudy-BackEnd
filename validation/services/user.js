const allowedUserFieldsForUpdate = {
  photo: true,
  firstName: true,
  lastName: true,
  address: {
    country: true,
    city: true
  },
  education: true,
  categories: true,
  nativeLanguage: true,
  appLanguage: true
}

module.exports = {
  allowedUserFieldsForUpdate
}
