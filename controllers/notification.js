const notificationService = require('~/services/notification')

const getNotifications = async (req, res) => {
  const { id: user, role: userRole } = req.user

  const notifications = await notificationService.getNotifications({ user, userRole })

  res.status(200).json(notifications)
}

const createNotification = async (req, res) => {
  const { id: user, role: userRole } = req.user
  const data = req.body

  const newNotification = await notificationService.createNotification(user, userRole, data)

  res.status(201).json(newNotification)
}

module.exports = {
  getNotifications,
  createNotification
}
