const activityHandler = require('~/event-handlers/activityHandler')

describe('activityHandler', () => {
  let io, socket, usersOnline

  beforeEach(() => {
    io = { emit: jest.fn(), sockets: { adapter: { rooms: new Map() } } }
    socket = {
      join: jest.fn(),
      on: jest.fn(),
      user: { id: 'user1' }
    }
    usersOnline = new Set()

    activityHandler(io, socket, usersOnline)
  })

  test('should call connectUser and add user to room and usersOnline set, then emit usersOnline event', () => {
    const connectUserCallback = socket.on.mock.calls.find(([event]) => event === 'connectUser')[1]

    connectUserCallback()

    expect(socket.join).toHaveBeenCalledWith('user1')
    expect(usersOnline.has('user1')).toBe(true)
    expect(io.emit).toHaveBeenCalledWith('usersOnline', Array.from(usersOnline))
  })

  test('should call disconnect and remove user from usersOnline set and emit usersOnline event', () => {
    usersOnline.add('user1')

    const disconnectCallback = socket.on.mock.calls.find(([event]) => event === 'disconnect')[1]

    disconnectCallback()

    expect(usersOnline.has('user1')).toBe(false)
    expect(io.emit).toHaveBeenCalledWith('usersOnline', Array.from(usersOnline))
  })

  test('should not delete the user from usersOnline when the user has at least one active session', () => {
    usersOnline.add('user1')
    io.sockets.adapter.rooms.set('user1', 'socketId')

    const disconnectCallback = socket.on.mock.calls.find(([event]) => event === 'disconnect')[1]

    disconnectCallback()

    expect(usersOnline.has('user1')).toBe(true)
    expect(io.emit).not.toHaveBeenCalled()
  })

  test('should call disconnect and do nothing if socket.user is undefined', () => {
    socket.user = undefined

    const disconnectCallback = socket.on.mock.calls.find(([event]) => event === 'disconnect')[1]

    disconnectCallback()

    expect(io.emit).not.toHaveBeenCalled()
  })
})
