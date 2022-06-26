const express = require('express')

const adminController = require('~/controllers/admin/admin')

const router = express.Router()

router.get('/', adminController.getAdmins)
router.get('/:userId', adminController.getAdmin)

module.exports = router
