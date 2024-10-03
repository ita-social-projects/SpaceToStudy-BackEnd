const mongoose = require('mongoose')

const Course = require('~/models/course')
const Cooperation = require('~/models/cooperation')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const { ObjectId } = mongoose.Types

const coursesAndCooperationsService = {
  getCoursesAndCooperationsByResourseId: async (resourceId, userId) => {
    const courses = await Course.find({
      $and: [{ author: new ObjectId(userId) }, { 'sections.resources.resource': new ObjectId(resourceId) }]
    })

    const cooperations = await Cooperation.find({
      $and: [
        {
          $or: [
            { receiverRole: TUTOR, receiver: new ObjectId(userId) },
            { initiatorRole: TUTOR, initiator: new ObjectId(userId) }
          ]
        },
        { 'sections.resources.resource': new ObjectId(resourceId) },
        { status: 'active' }
      ]
    })

    return { courses, cooperations }
  }
}

module.exports = coursesAndCooperationsService
