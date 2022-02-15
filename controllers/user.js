const User = require('~/models/user');
const { errors: { USER_NOT_FOUND } } = require('../consts/index');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    const usersResponse = users.map(user => { 
        return {
            _id: user._id,
            role: user.role,
            email: user.email,
            phoneNumber: user.phoneNumber
        }
    });

    res.status(200).json({
        users: usersResponse
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

    const { password, __v, ...userResponse } = user;

    res.status(200).json({
        user: userResponse
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
    password: password,
    phoneNumber: phoneNumber
  })
  
  try {
    const savedUser = await user.save();

    const { password, __v, ...savedUserResponse } = savedUser._doc;

    res.status(201).json({
      user: savedUserResponse
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