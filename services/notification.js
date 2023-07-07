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
  createNotification: async (user, userRole, data) => {
    const { type, reference, referenceModel } = data

    return await Notification.create({
      user,
      userRole,
      type,
      reference,
      referenceModel
    })
  }
}

module.exports = notificationService
