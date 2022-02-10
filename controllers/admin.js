const User = require('~/models/user')
const { roles: { ADMIN }, errors: { ADMIN_NOT_FOUND } } = require('../consts/index');

exports.getAdmins = async (req, res) => {
  try {
    const users = await User.find().lean();

    const admins = users?.filter(user => user.role === ADMIN);

    admins.forEach(admin => delete admin.password);

    res.status(200).json({
        users: admins
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getAdmin = async (req, res) => {
    const userId = req.params.userId
  try {
    const admin = await User.findById(userId).lean();
    
    if (!admin || admin.role !== ADMIN) {
      const error = new Error(ADMIN_NOT_FOUND)
      error.statusCode = 404
      throw error
    }

    delete admin.password;

    res.status(200).json({
        user: admin
    })
  } catch (e) {
    console.log(e)
  }
}