const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

const {
  config: { CLIENT_URL }
} = require('~/configs/config')
const swaggerOptions = require('../../swagger-settings')
const router = require('~/routes')
const { createNotFoundError } = require('~/utils/errorsHelper')
const errorMiddleware = require('~/middlewares/error')

const initialization = (app) => {
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
      methods: 'GET, POST, PATCH, DELETE',
      allowedHeaders: 'Content-Type, Authorization'
    })
  )

  const swaggerSettings = swaggerJsDoc(swaggerOptions)
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSettings))

  app.use('/', router)

  app.use((_req, _res, next) => {
    next(createNotFoundError())
  })

  app.use(errorMiddleware)
}

module.exports = initialization
