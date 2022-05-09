const express = require('express')

const user = require('~/controllers/user')

const router = express.Router()

router.get('/', user.getUsers)
router.get('/:userId', user.getUser)
router.post('/', user.postUser)
router.delete('/:userId', user.deleteUser)

module.exports = router
