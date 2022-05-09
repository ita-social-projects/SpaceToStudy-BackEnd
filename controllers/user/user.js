const User = require('~/models/user')
const { hashPassword } = require('~/controllers/utils/auth')
const { createError } = require('~/utils/errors')

const { 
  errorCodes: {
    NOT_FOUND
  },
  errorMessages: {
    userNotRegistered,
  }
} = require('~/consts/errors')

const getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    const usersResponse = users.map(user => { 
        return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
            phoneNumber: user.phoneNumber // ??
        }
    })

    res.status(200).json({
        users: usersResponse
    })
  } catch (err) {
    console.log(err)
  }
}

const getUser = async (req, res) => {
  const userId = req.params.userId

  try {
    const user = await User.findById(userId).lean();
    
    if (!user) throw createError(404, NOT_FOUND, userNotRegistered)

    const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
            phoneNumber: user.phoneNumber // ??
        }

    res.status(200).json({
        user: userResponse
    })
  } catch (err) {
    next(err)
  }
}

const postUser = async (req, res) => {
  const { firstName, lastName, role, email, password, phoneNumber } = req.body
  const hashedPassword = await hashPassword(password)

  const user = new User({
    firstName: firstName,
    lastName: lastName,
    role: role,
    email: email,
    password: hashedPassword,
    phoneNumber: phoneNumber // ??
  })
  
  try {
    const savedUser = await user.save();

    const savedUserResponse = {
        id: savedUser._doc._id,
        firstName: savedUser._doc.firstName,
        lastName: savedUser._doc.lastName,
        role: savedUser._doc.role,
        email: savedUser._doc.email,
        phoneNumber: savedUser._doc.phoneNumber // ??
    }

    res.status(201).json({
      user: savedUserResponse
    })
  } catch (err) {
    console.log(err)
  }
}

const deleteUser = async (req, res) => {
  const userId = req.params.userId
  try {
    const user = await User.findById(userId)
    
    if (!user) throw createError(404, NOT_FOUND, userNotRegistered)

    await User.findByIdAndRemove(userId)

    res.status(200).json({ message: 'User deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getUsers,
  getUser,
  postUser,
  deleteUser
}
