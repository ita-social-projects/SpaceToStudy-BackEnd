const Notification = require('~/models/notification')

const notificationService = {
  getNotifications: async (match) => {
    const items = await Notification.find(match).exec()
    const count = await Notification.countDocuments(match)

    return {
      items,
      count
    }
  },

  clearNotifications: async (user) => {
    await Notification.deleteMany({ user }).exec()
  }
}

module.exports = notificationService
