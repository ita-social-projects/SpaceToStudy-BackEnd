const router = require('express').Router()

const langMiddleware = require('~/middlewares/appLanguage')
const asyncWrapper = require('~/middlewares/asyncWrapper')

const adminInvitationController = require('~/controllers/adminInvitation')

router.post('/', langMiddleware, asyncWrapper(adminInvitationController.sendAdminInvitations))
router.get('/', asyncWrapper(adminInvitationController.getAdminInvitations))

module.exports = router
