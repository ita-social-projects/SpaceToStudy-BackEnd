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
  videoLink: true,
  notificationSettings: {
    isOfferStatusNotification: true,
    isChatNotification: true,
    isSimilarOffersNotification: true,
    isEmailNotification: true
  }
}

const allowedTutorFieldsForUpdate = {
  professionalBlock: {
    awards: true,
    scientificActivities: true,
    workExperience: true,
    education: true
  }
}

const allowedStudentFieldsForUpdate = {
  aboutStudent: {
    personalIntroduction: true,
    learningGoals: true,
    learningActivities: true
  }
}

module.exports = {
  allowedUserFieldsForUpdate,
  allowedTutorFieldsForUpdate,
  allowedStudentFieldsForUpdate
}
