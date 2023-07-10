const router = require('express').Router({ mergeParams: true })

const notificationController = require('~/controllers/notification')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')

router.use(authMiddleware)

router.get('/', asyncWrapper(notificationController.getNotifications))
router.delete('/', asyncWrapper(notificationController.clearNotifications))

module.exports = router
