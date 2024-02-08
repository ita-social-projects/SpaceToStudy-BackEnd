const router = require('express').Router()

const langMiddleware = require('~/app/middlewares/appLanguage')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')

const adminInvitationController = require('~/app/controllers/adminInvitation')

router.post('/', langMiddleware, asyncWrapper(adminInvitationController.sendAdminInvitations))
router.get('/', asyncWrapper(adminInvitationController.getAdminInvitations))

module.exports = router
