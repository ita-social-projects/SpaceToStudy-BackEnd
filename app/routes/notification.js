const router = require('express').Router({ mergeParams: true })

const notificationController = require('~/app/controllers/notification')
const asyncWrapper = require('~/app/middlewares/asyncWrapper')
const { authMiddleware } = require('~/app/middlewares/auth')
const isEntityValid = require('~/app/middlewares/entityValidation')
const idValidation = require('~/app/middlewares/idValidation')
const Notification = require('~/app/models/notification')

const params = [{ model: Notification, idName: 'id' }]

router.use(authMiddleware)
router.param('id', idValidation)

router.get('/', asyncWrapper(notificationController.getNotifications))
router.delete('/', asyncWrapper(notificationController.clearNotifications))
router.delete('/:id', isEntityValid({ params }), asyncWrapper(notificationController.deleteNotification))

module.exports = router
