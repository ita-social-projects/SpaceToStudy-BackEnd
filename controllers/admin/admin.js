const User = require('~/models/user')
const { roles: { ADMIN } } = require('~/consts/auth')
const { errors: { NOT_FOUND } } = require('~/consts/errors')

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({
        "role": ADMIN
    }).lean()

    const adminsResponse = admins.map(admin => { 
        return {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            email: admin.email,
            phoneNumber: admin.phoneNumber // ??
        }
    })

    res.status(200).json({
        users: adminsResponse
    })
  } catch (err) {
    console.log(err)
  }
}

const getAdmin = async (req, res) => {
    const userId = req.params.userId
  try {
    const admin = await User.findOne({
        "_id": userId,
        "role": ADMIN
    }).lean()
    
    if (!admin) {
      const error = new Error(NOT_FOUND)
      error.statusCode = 404
      throw error
    }
    
    const adminResponse = {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            email: admin.email,
            phoneNumber: admin.phoneNumber // ??
        }

    res.status(200).json({
        user: adminResponse
    })
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getAdmin,
  getAdmins
}
