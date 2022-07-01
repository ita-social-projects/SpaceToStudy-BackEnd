require('module-alias/register')
require('./module-aliases')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

const swaggerOptions = require('~/swagger-settings')

const example = require('~/routes/example')
const admin = require('~/routes/admin')
const auth = require('~/routes/auth')
const user = require('~/routes/user')
const { createError, handleError } = require('~/utils/errors')
const logger = require('~/logger/logger')

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

const swaggerSettings = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSettings))

app.use('/example', example)
app.use('/auth', auth)
app.use('/users', user)
app.use('/admins', admin)

app.use((req, res, next) => {
  const err = createError(404, 'NOT_FOUND', 'Wrong path')
  next(err)
})

app.use(handleError)

mongoose
  .connect(
    process.env.MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    logger.info('Connected to MongoDB.')
  )
  .then(() => {
    app.listen(process.env.SERVER_PORT, () => {
      logger.info(`Server is running on port ${process.env.SERVER_PORT}`)
    })
  })
  .catch((err) => logger.error(err))
