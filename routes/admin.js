const express = require('express')

const admin = require('~/controllers/admin/admin')

const router = express.Router()

router.get('/', admin.getAdmins)
router.get('/:userId', admin.getAdmin)

module.exports = router
