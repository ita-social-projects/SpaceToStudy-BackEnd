require('module-alias/register')
require('./module-aliases')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

const swaggerOptions = require('~/swagger-settings')
const checkUserExistence = require('~/seed/checkUserExistence')

const router = require('~/routes')
const { createNotFoundError } = require('~/utils/errorsHelper')
const logger = require('~/logger/logger')
const errorMiddleware = require('~/middlewares/error')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL
  })
)

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

const swaggerSettings = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSettings))

app.use('/', router)

app.use((_req, _res, next) => {
  next(createNotFoundError())
})

app.use(errorMiddleware)

mongoose
  .connect(
    process.env.MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    logger.info('Connected to MongoDB.')
  )
  .then(() => {
    checkUserExistence()
  })
  .then(() => {
    app.listen(process.env.SERVER_PORT, () => {
      logger.info(`Server is running on port ${process.env.SERVER_PORT}`)
    })
  })
  .catch((err) => logger.error(err))
