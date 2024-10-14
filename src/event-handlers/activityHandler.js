module.exports = (io, socket, usersOnline) => {
  const connectUser = () => {
    socket.join(socket.user.id)
    usersOnline.add(socket.user.id)
    io.emit('usersOnline', Array.from(usersOnline))
  }

  const disconnect = () => {
    if (socket.user && !io.sockets.adapter.rooms.has(socket.user.id)) {
      usersOnline.delete(socket.user.id)
      io.emit('usersOnline', Array.from(usersOnline))
    }
  }

  socket.on('connectUser', connectUser)
  socket.on('disconnect', disconnect)
}
