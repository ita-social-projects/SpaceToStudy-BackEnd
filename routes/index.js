const express = require('express')

const admin = require('~/routes/admin')
const auth = require('~/routes/auth')
const user = require('~/routes/user')
const student = require('~/routes/student')
const email = require('~/routes/email')
const review = require('~/routes/review')
const subject = require('~/routes/subject')
const tutor = require('~/routes/tutor')
const adminInvitation = require('~/routes/adminInvitation')

const router = express.Router()

router.use('/auth', auth)
router.use('/users', user)
router.use('/students', student)
router.use('/admins', admin)
router.use('/send-email', email)
router.use('/reviews', review)
router.use('/subjects', subject)
router.use('/tutors', tutor)
router.use('/admin-invitations', adminInvitation)

module.exports = router
