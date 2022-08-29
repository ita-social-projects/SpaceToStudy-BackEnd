const express = require('express')

const example = require('~/routes/example')
const admin = require('~/routes/admin')
const auth = require('~/routes/auth')
const user = require('~/routes/user')
const email = require('~/routes/email')

const router = express.Router()

router.use('/example', example)
router.use('/auth', auth)
router.use('/users', user)
router.use('/admins', admin)
router.use('/send-email', email)

module.exports = router
