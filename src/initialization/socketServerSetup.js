const fs = require('fs')
const path = require('path')
const { createServer: createHttpServer } = require('http')
const { createServer: createHttpsServer } = require('https')
const { Server } = require('socket.io')
const {
  config: { COOKIE_DOMAIN, CLIENT_URL, USE_SSL, SSL_CERT_PATH, SSL_KEY_PATH }
} = require('~/configs/config')

const { oneDayInMs } = require('~/consts/auth')
const { authSocketMiddleware } = require('~/middlewares/auth')
const registerActivityHandlers = require('~/event-handlers/activityHandler')
const registerMessageHandlers = require('~/event-handlers/messageHandler')

let usersOnline = new Set()

const socketServerSetup = (app) => {
  const useSsl = USE_SSL === 'true'
  const server = useSsl ? httpsServerSetup(app) : httpServerSetup(app)

  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
      methods: 'GET, POST, PATCH, DELETE',
      allowedHeaders: 'Content-Type, Authorization'
    },
    cookie: {
      maxAge: oneDayInMs,
      httpOnly: true,
      secure: useSsl,
      sameSite: 'none',
      domain: COOKIE_DOMAIN
    }
  })

  io.use(authSocketMiddleware)

  io.on('connection', (socket) => onConnection(socket, io))

  return server
}

const httpServerSetup = (app) => {
  return createHttpServer(app)
}

const httpsServerSetup = (app) => {
  const cert = fs.readFileSync(path.resolve(__dirname, SSL_CERT_PATH))
  const key = fs.readFileSync(path.resolve(__dirname, SSL_KEY_PATH))

  return createHttpsServer({ key, cert }, app)
}

const onConnection = (socket, io) => {
  registerActivityHandlers(io, socket, usersOnline)
  registerMessageHandlers(io, socket, usersOnline)
}

module.exports = socketServerSetup
