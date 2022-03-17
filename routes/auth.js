const express = require('express')

const auth = require('~/controllers/auth')

const router = express.Router()

const use = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.post('/signup', use(auth.signup))
router.post('/login', use(auth.login))

module.exports = router
