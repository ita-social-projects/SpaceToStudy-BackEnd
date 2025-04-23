const { Server } = require('socket.io')
const {
  config: { COOKIE_DOMAIN, CLIENT_URL }
} = require('~/configs/config')

const { oneDayInMs } = require('~/consts/auth')
const { authSocketMiddleware } = require('~/middlewares/auth')
const registerActivityHandlers = require('~/event-handlers/activityHandler')
const registerMessageHandlers = require('~/event-handlers/messageHandler')

let usersOnline = new Set()

const socketServerSetup = (server) => {
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
      secure: true,
      sameSite: 'none',
      domain: COOKIE_DOMAIN
    }
  })

  io.use(authSocketMiddleware)
  io.on('connection', (socket) => onConnection(socket, io))

  return server
}

const onConnection = (socket, io) => {
  registerActivityHandlers(io, socket, usersOnline)
  registerMessageHandlers(io, socket, usersOnline)
}

module.exports = socketServerSetup
