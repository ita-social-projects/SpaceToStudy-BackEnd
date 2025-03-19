const {
  lengths: {
    MAX_NAME_LENGTH,
    MIN_NAME_LENGTH,
    MIN_PROFFESSIONAL_SUMMARY_LENGTH,
    MAX_PROFFESSIONAL_SUMMARY_LENGTH,
    MAX_PROFESSIONAL_BLOCK_FIELD_LENGTH,
    MAX_ABOUT_STUDENT_FIELD_LENGTH
  },
  enums: { SPOKEN_LANG_ENUM, APP_LANG_ENUM },
  regex: { VIDEOLINK_PATTERN, NAME_PATTERN }
} = require('~/consts/validation')

const mainSubjectsItem = {
  type: 'object',
  properties: {
    category: {
      type: 'object',
      required: true,
      properties: {
        _id: {
          type: 'string'
        }
      }
    },
    subjects: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          _id: {
            type: 'string'
          }
        }
      }
    }
  }
}

const FAQItem = {
  type: 'object',
  properties: {
    question: {
      type: 'string',
      required: true
    },
    answer: {
      type: 'string',
      required: true
    }
  }
}

const updateUserValidationSchema = {
  firstName: {
    regex: NAME_PATTERN,
    required: false,
    length: {
      min: MIN_NAME_LENGTH,
      max: MAX_NAME_LENGTH
    }
  },
  lastName: {
    regex: NAME_PATTERN,
    required: false,
    length: {
      min: MIN_NAME_LENGTH,
      max: MAX_NAME_LENGTH
    }
  },
  professionalSummary: {
    type: 'string',
    canBeNull: true,
    required: false,
    length: {
      min: MIN_PROFFESSIONAL_SUMMARY_LENGTH,
      max: MAX_PROFFESSIONAL_SUMMARY_LENGTH
    }
  },
  nativeLanguage: {
    canBeNull: true,
    enum: SPOKEN_LANG_ENUM,
    required: false
  },
  appLanguage: {
    enum: APP_LANG_ENUM,
    required: false
  },
  videoLink: {
    regex: VIDEOLINK_PATTERN,
    required: false
  },
  notificationSettings: {
    type: 'object',
    required: false,
    properties: {
      isOfferStatusNotification: {
        type: 'boolean',
        required: false
      },
      isChatNotification: {
        type: 'boolean',
        required: false
      },
      isSimilarOffersNotification: {
        type: 'boolean',
        required: false
      },
      isEmailNotification: {
        type: 'boolean',
        required: false
      }
    }
  },
  address: {
    type: 'object',
    required: false,
    properties: {
      country: {
        type: 'string',
        required: false
      },
      city: {
        type: 'string',
        required: false
      }
    }
  },
  photo: {
    type: ['object', 'string'],
    required: false,
    regex: /^$/,
    properties: {
      src: {
        type: 'string',
        required: true
      },
      name: {
        type: 'string',
        required: true
      }
    }
  },
  professionalBlock: {
    type: 'object',
    required: false,
    properties: {
      awards: {
        type: 'string',
        required: false,
        length: {
          max: MAX_PROFESSIONAL_BLOCK_FIELD_LENGTH
        }
      },
      scientificActivities: {
        type: 'string',
        required: false,
        length: {
          max: MAX_PROFESSIONAL_BLOCK_FIELD_LENGTH
        }
      },
      workExperience: {
        type: 'string',
        required: false,
        length: {
          max: MAX_PROFESSIONAL_BLOCK_FIELD_LENGTH
        }
      },
      education: {
        type: 'string',
        required: false,
        length: {
          max: MAX_PROFESSIONAL_BLOCK_FIELD_LENGTH
        }
      }
    }
  },
  aboutStudent: {
    type: 'object',
    required: false,
    properties: {
      personalIntroduction: {
        type: 'string',
        required: false,
        length: {
          max: MAX_ABOUT_STUDENT_FIELD_LENGTH
        }
      },
      learningGoals: {
        type: 'string',
        required: false,
        length: {
          max: MAX_ABOUT_STUDENT_FIELD_LENGTH
        }
      },
      learningActivities: {
        type: 'string',
        required: false,
        length: {
          max: MAX_ABOUT_STUDENT_FIELD_LENGTH
        }
      }
    }
  },
  mainSubjects: {
    type: 'object',
    required: false,
    properties: {
      student: {
        type: 'array',
        required: false,
        items: mainSubjectsItem
      },
      tutor: {
        type: 'array',
        required: false,
        items: mainSubjectsItem
      }
    }
  },
  FAQ: {
    type: 'object',
    required: false,
    properties: {
      type: 'object',
      required: false,
      properties: {
        student: {
          type: 'array',
          required: false,
          items: FAQItem
        },
        tutor: {
          type: 'array',
          required: false,
          items: FAQItem
        }
      }
    }
  }
}

module.exports = updateUserValidationSchema
