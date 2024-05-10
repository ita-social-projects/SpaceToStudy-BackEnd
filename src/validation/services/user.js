const allowedUserFieldsForUpdate = {
  photo: true,
  firstName: true,
  lastName: true,
  address: {
    country: true,
    city: true
  },
  professionalSummary: true,
  mainSubjects: true,
  nativeLanguage: true,
  appLanguage: true,
  FAQ: true,
  videoLink: true
}

const allowedTutorFieldsForUpdate = {
  professionalBlock: {
    categories: true,
    awards: true,
    scientificActivities: true,
    workExperience: true,
    education: true
  }
}

module.exports = {
  allowedUserFieldsForUpdate,
  allowedTutorFieldsForUpdate
}
