const express = require('express')

const idValidation = require('~/middlewares/idValidation')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const adminController = require('~/controllers/admin')

const router = express.Router()

router.param('userId', idValidation)

router.get('/', asyncWrapper(adminController.getAdmins))
router.get('/:userId', asyncWrapper(adminController.getAdmin))

module.exports = router
