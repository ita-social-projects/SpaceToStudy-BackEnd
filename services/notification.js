const Notification = require('~/models/notification')

const notificationService = {
  getNotifications: async (match) => {
    const items = await Notification.find(match).exec()
    const count = await Notification.countDocuments(match)

    return {
      items,
      count
    }
  }
}

module.exports = notificationService
