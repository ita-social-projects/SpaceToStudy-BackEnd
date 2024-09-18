module.exports = (io, socket, usersOnline) => {
  const connectUser = () => {
    socket.join(socket.user.id)
    usersOnline.add(socket.user.id)
    io.emit('usersOnline', Array.from(usersOnline))
  }

  const disconnect = () => {
    if (socket.user) {
      usersOnline.delete(socket.user.id)
      io.emit('usersOnline', Array.from(usersOnline))
    }
  }

  socket.on('connectUser', connectUser)
  socket.on('disconnect', disconnect)
}
