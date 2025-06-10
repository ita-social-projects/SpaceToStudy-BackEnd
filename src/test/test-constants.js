const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

const collectionNames = {
  SUBJECTS: 'subjects',
  CATEGORIES: 'categories',
  OFFERS: 'offers',
  COOPERATIONS: 'cooperation'
}

const testCategoryData = {
  name: 'IT',
  appearance: {
    icon: 'AccountTreeRoundedIcon',
    color: '#47B8B8'
  }
}

const testCooperationData = {
  price: 400,
  offer: '6750caa8466f194485b1e19a',
  receiver: '6750ca3f466f194485b1e178',
  receiverRole: 'tutor',
  initiator: '6736f6cec333d2e67f3710dc',
  initiatorRole: 'student',
  proficiencyLevel: ['Beginner'],
  title: 'Test cooperation title',
  description: 'Some description...',
  subject: '6502ec2060ec37be943353e2',
  category: '64884fedfdc2d1a130c24ade',
  languages: ['English'],
  needAction: {
    role: 'tutor',
    type: 'price',
    messages: []
  },
  sections: [
    {
      title: 'Section 1',
      description: 'Section 1 description',
      resources: [
        {
          resource: {
            _id: '6684179479e5232bce4579fa',
            author: '6658f73f93885febb491e08b',
            content: '<p><strong>Solving Quadratic Equations Using the Quadratic Formula</strong></p>',
            description: 'The quadratic formula',
            title: 'Solving Quadratic Equations Using the Quadratic Formula',
            category: '6684175179e5232bce4579ed',
            resourceType: RESOURCES_TYPES_ENUM[0]
          },
          resourceType: RESOURCES_TYPES_ENUM[0],
          availability: { status: 'open', date: null }
        }
      ]
    }
  ]
}

const testSubjectData = { name: 'Web Development' }

module.exports = { testCategoryData, testSubjectData, testCooperationData, collectionNames }
