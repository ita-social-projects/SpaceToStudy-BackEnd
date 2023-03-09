const allowedUserFieldsForUpdate = {
  photo: true,
  firstName: true,
  lastName: true,
  address: {
    country: true,
    city: true
  },
  city: true,
  experience: true,
  subject: true,
  averageRating: true,
  nativeLanguage: true,
  appLanguage: true
}

module.exports = {
  allowedUserFieldsForUpdate
}
