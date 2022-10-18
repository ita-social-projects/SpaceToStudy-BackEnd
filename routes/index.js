const express = require('express')

const admin = require('~/routes/admin')
const auth = require('~/routes/auth')
const user = require('~/routes/user')
const email = require('~/routes/email')
const review = require('~/routes/review')

const router = express.Router()

router.use('/auth', auth)
router.use('/users', user)
router.use('/admins', admin)
router.use('/send-email', email)
router.use('/review', review)

module.exports = router
