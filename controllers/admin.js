const User = require('~/models/user')
const { roles: { ADMIN }, errors: { ADMIN_NOT_FOUND } } = require('../consts/index');

exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({
        "role": ADMIN
    }).lean();

    const adminsResponse = admins.map(admin => { 
        return {
            _id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            email: admin.email,
            phoneNumber: admin.phoneNumber
        }
    });

    res.status(200).json({
        users: adminsResponse
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getAdmin = async (req, res) => {
    const userId = req.params.userId
  try {
    const admin = await User.findOne({
        "_id": userId,
        "role": ADMIN
    }).lean();
    
    if (!admin) {
      const error = new Error(ADMIN_NOT_FOUND)
      error.statusCode = 404
      throw error
    }

    const { password, __v, ...adminResponse } = admin;

    res.status(200).json({
        user: adminResponse
    })
  } catch (e) {
    console.log(e)
  }
}