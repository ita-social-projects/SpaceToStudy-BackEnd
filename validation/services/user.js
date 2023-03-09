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
  totalReviews: true,
  averageRating: true,
  nativeLanguage: true,
  appLanguage: true
}

module.exports = {
  allowedUserFieldsForUpdate
}
