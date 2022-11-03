const Admin = require('~/models/admin')
const { ADMIN_NOT_FOUND } = require('~/consts/errors')
const { createError } = require('~/utils/errorsHelper')
const emailService = require('~/services/email')
const emailSubject = require('~/consts/emailSubject')
const adminInvitation = require('~/models/admin-invitation')

const adminService = {
  inviteAdmins: async ({ emails, language }) => {
    const invitations = []

    for (const email of emails) {
      const invitation = await adminInvitation.create({
        email,
        dateOfInvitation: Date.now()
      })
  
      await emailService.sendEmail(email, emailSubject.ADMIN_INVITATION, language, { email })

      invitations.push(invitation)
    }
    
    return invitations
  },
  getAdmins: async ({
    skip = 0,
    limit = 10,
    name,
    email,
    active,
    blocked,
    signUpDateFrom,
    signUpDateTo,
    lastLoginFrom,
    lastLoginTo,
    sortByName,
    sortByEmail,
    sortByLastLogin,
    sortBySignUpDate,
  }) => {
    const match = {
      name: {
        $regex: name.length > 0 ? name : '.*',
        $options: 'i'
      },
      email: {
        $regex: email.length > 0 ? email : '.*',
        $options: 'i'
      },
      active,
      blocked,
      signUpDate: {
        $gte: signUpDateFrom,
        $lte: signUpDateTo
      },
      lastLogin: {
        $gte: lastLoginFrom,
        $lte: lastLoginTo
      },
    }

    const sort = {
      name: sortByName,
      email: sortByEmail,
      lastLogin: sortByLastLogin,
      signUpDate: sortBySignUpDate
    }

    const [admins] = await Admin.aggregate([
      {
        $addFields: {
          name: { $concat: ['$firstName', ' ', '$lastName'] },
        },
      },
      {
        $project: {
          firstName: 0,
          lastName: 0
        }
      }
    ])
    .facet({
      items: [
        { $match: match },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit }
      ],
      calculations: [{ $match: match }, { $count: 'count' }],
    })
    .exec()

    return {
      items: admins.items,
      count: admins.calculations[0].count
    }
  },

  getAdminById: async (id) => {
    const admin = await Admin.findById(id)
      .lean()
      .exec()

    if (!admin) {
      throw createError(404, ADMIN_NOT_FOUND)
    }

    return admin
  }
}

module.exports = adminService
