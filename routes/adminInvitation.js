const express = require('express')

const langMiddleware = require('~/middlewares/language')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const adminInvitationController = require('~/controllers/adminInvitation')

const router = express.Router()

router.post('/', langMiddleware, asyncWrapper(adminInvitationController.sendAdminInvitations))
router.get('/', asyncWrapper(adminInvitationController.getAdminInvitations))

module.exports = router
