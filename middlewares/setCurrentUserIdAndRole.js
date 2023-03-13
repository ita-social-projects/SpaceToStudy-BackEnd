const setCurrentUserIdAndRole = (req, res, next) => {
  req.params.id = req.user.id
  req.params.role = req.user.role

  next()
}

module.exports = setCurrentUserIdAndRole
