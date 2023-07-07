const notificationService = require('~/services/notification')

const getNotifications = async (req, res) => {
  const { id: user, role: userRole } = req.user

  const notifications = await notificationService.getNotifications({ user, userRole })

  res.status(200).json(notifications)
}

module.exports = {
  getNotifications
}
