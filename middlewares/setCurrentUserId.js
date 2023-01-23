const setCurrentUserId = (req, res, next) => {
  req.params.id = req.user.id
  console.log('req.params.id', req.params.id)
  console.log('req.params', req.params)

  console.log('req.user', req.user)

  next()
}

module.exports = setCurrentUserId
