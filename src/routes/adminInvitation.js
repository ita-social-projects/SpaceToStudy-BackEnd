const router = require('express').Router()

const langMiddleware = require('~/middlewares/appLanguage')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware, restrictTo } = require('~/middlewares/auth')
const {
  roles: { SUPERADMIN }
} = require('~/consts/auth')

const adminInvitationController = require('~/controllers/adminInvitation')
router.use(authMiddleware)

router.use(restrictTo(SUPERADMIN))
router.post('/', langMiddleware, asyncWrapper(adminInvitationController.sendAdminInvitations))
router.get('/', asyncWrapper(adminInvitationController.getAdminInvitations))

module.exports = router
