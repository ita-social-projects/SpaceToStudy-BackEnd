const express = require('express')

const admin = require('~/routes/admin')
const auth = require('~/routes/auth')
const user = require('~/routes/user')
const email = require('~/routes/email')
const review = require('~/routes/review')
const subject = require('~/routes/subject')
const location = require('~/routes/location')
const adminInvitation = require('~/routes/adminInvitation')

const router = express.Router()

router.use('/auth', auth)
router.use('/users', user)
router.use('/admins', admin)
router.use('/send-email', email)
router.use('/reviews', review)
router.use('/subjects', subject)
router.use('/location', location)
router.use('/admin-invitations', adminInvitation)

module.exports = router
