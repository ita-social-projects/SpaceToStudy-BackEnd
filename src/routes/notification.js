const router = require('express').Router({ mergeParams: true })

const notificationController = require('~/controllers/notification')
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const isEntityValid = require('~/middlewares/entityValidation')
const idValidation = require('~/middlewares/idValidation')
const Notification = require('~/models/notification')

const params = [{ model: Notification, idName: 'id' }]

router.use(authMiddleware)
router.param('id', idValidation)

router.get('/', asyncWrapper(notificationController.getNotifications))
router.delete('/', asyncWrapper(notificationController.clearNotifications))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(notificationController.deleteNotification))

module.exports = router
