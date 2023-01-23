const setCurrentUserId = (req, res, next) => {
  req.params.id = req.user.id

  next()
}

module.exports = setCurrentUserId
