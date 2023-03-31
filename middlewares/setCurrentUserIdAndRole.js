const setCurrentUserIdAndRole = (req, res, next) => {
  req.params.id = req.user.id
  req.query.role = req.user.role

  next()
}

module.exports = setCurrentUserIdAndRole
