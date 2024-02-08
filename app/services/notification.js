const Notification = require('~/app/models/notification')

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
  },

  createNotification: async (data) => {
    const { user, userRole, type, reference, referenceModel } = data

    return await Notification.create({
      user,
      userRole,
      type,
      reference,
      referenceModel
    })
  },

  deleteNotification: async (id) => {
    await Notification.findByIdAndDelete(id).exec()
  }
}

module.exports = notificationService
