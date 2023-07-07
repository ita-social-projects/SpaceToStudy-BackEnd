const router = require('express').Router({ mergeParams: true })

const notificationController = require('~/controllers/notification')
const asyncWrapper = require('~/middlewares/asyncWrapper')

router.get('/', asyncWrapper(notificationController.getNotifications))

module.exports = router
