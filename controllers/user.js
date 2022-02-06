const User = require('~/models/user')

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
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
    const user = await User.findById(userId)
    
    if (!user) {
      const error = new Error('Could not find user.')
      error.statusCode = 404
      throw error
    }

    res.status(200).json({
        user: user
    })
  } catch (e) {
    console.log(e)
  }
  }

exports.postUser = async (req, res) => {
  const { firstName, lastName, role, email, password, phoneNumber } = req.body
  const user = new User({
    firstName: firstName,
    lastName: lastName,
    role: role,
    email: email,
    password: password,
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
      const error = new Error('Could not find user.')
      error.statusCode = 404
      throw error
    }

    await User.findByIdAndRemove(userId)

    res.status(200).json({ message: 'User deleted.' })
  } catch (e) {
    console.log(e)
  }
}