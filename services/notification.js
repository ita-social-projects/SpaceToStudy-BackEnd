const Notification = require('~/models/notification')

const notificationService = {
  getNotifications: async (match) => {
    const notifications = await Notification.find(match).countDocuments().exec()
    const count = await Notification.countDocuments(match)

    return {
      items: notifications,
      count
    }
  }
}

module.exports = notificationService
