require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test.local' : '.env.local'
})
require('dotenv').config()
