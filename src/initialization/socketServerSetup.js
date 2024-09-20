const { createServer } = require('http')
const { Server } = require('socket.io')
const { authSocketMiddleware } = require('~/middlewares/auth')
const registerActivityHandlers = require('~/event-handlers/activityHandler')
const {
  config: { CLIENT_URL }
} = require('~/configs/config')

let usersOnline = new Set()

const socketServerSetup = (app) => {
  const server = createServer(app)
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
      methods: 'GET, POST, PATCH, DELETE',
      allowedHeaders: 'Content-Type, Authorization'
    },
    cookie: true
  })

  io.use(authSocketMiddleware)

  io.on('connection', (socket) => onConnection(socket, io))

  return server
}

const onConnection = (socket, io) => {
  registerActivityHandlers(io, socket, usersOnline)
}

module.exports = socketServerSetup
