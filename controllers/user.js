const User = require('~/models/user');
const { errors: { USER_NOT_FOUND } } = require('../consts/index');
const { encryptPasword } = require('../utils/password-encrypter');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    users.forEach(user => delete user.password);

    res.status(200).json({
        users: users
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getUser = async (req, res) => {
    const userId = req.params.userId
  try {
    const user = await User.findById(userId).lean();
    
    if (!user) {
      const error = new Error(USER_NOT_FOUND)
      error.statusCode = 404
      throw error
    }

    delete user.password;

    res.status(200).json({
        user: user
    })
  } catch (e) {
    console.log(e)
  }
  }

exports.postUser = async (req, res) => {
  const { role, email, password, phoneNumber } = req.body
  const user = new User({
    role: role,
    email: email,
    password: encryptPasword(password),
    phoneNumber: phoneNumber
  })
  
  try {
    const savedUser = await user.save()
    res.status(201).json({
      item: savedUser
    })
  } catch (err) {
    console.log(err)
  }
}

exports.deleteUser = async (req, res) => {
  const userId = req.params.userId
  try {
    const user = await User.findById(userId)
    
    if (!user) {
      const error = new Error(USER_NOT_FOUND)
      error.statusCode = 404
      throw error
    }

    await User.findByIdAndRemove(userId)

    res.status(200).json({ message: 'User deleted.' })
  } catch (e) {
    console.log(e)
  }
}