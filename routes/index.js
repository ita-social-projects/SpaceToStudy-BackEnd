const express = require('express')

const example = require('~/routes/example')
const admin = require('~/routes/admin')
const auth = require('~/routes/auth')
const user = require('~/routes/user')
const role = require('~/routes/role')

const router = express.Router()

router.use('/example', example)
router.use('/auth', auth)
router.use('/users', user)
router.use('/admins', admin)
router.use('/roles', role)

module.exports = router
