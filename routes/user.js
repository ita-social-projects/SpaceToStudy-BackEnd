const express = require('express')

const user = require('~/controllers/user/user')

const router = express.Router()

router.get('/', user.getUsers)
router.get('/:userId', user.getUser)
router.delete('/:userId', user.deleteUser)

module.exports = router
