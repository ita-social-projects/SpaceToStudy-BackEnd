const activityHandler = require('~/event-handlers/activityHandler')
const userSchema = require('~/models/user')

const mockFindById = (socketUserId) => (id) => {
  const isUserIdMatch = id.toString() === socketUserId.toString()
  return {
    lean: () => ({
      exec: () => Promise.resolve(isUserIdMatch ? { _id: id } : null)
    })
  }
}

const mockFindByIdAndUpdate = () => (id, update) => ({
  lean: () => ({
    exec: () => Promise.resolve({ _id: id, ...update.$set })
  })
})

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

    jest.spyOn(userSchema, 'findById').mockImplementation(mockFindById(socket.user.id))
    jest.spyOn(userSchema, 'findByIdAndUpdate').mockImplementation(mockFindByIdAndUpdate())

    activityHandler(io, socket, usersOnline)
  })

  test('should call connectUser and add user to room and usersOnline set, then emit usersOnline event', () => {
    const connectUserCallback = socket.on.mock.calls.find(([event]) => event === 'connectUser')[1]

    connectUserCallback()

    expect(socket.join).toHaveBeenCalledWith('user1')
    expect(usersOnline.has('user1')).toBe(true)
    expect(io.emit).toHaveBeenCalledWith('usersOnline', Array.from(usersOnline))
  })

  test('should call disconnect and remove user from usersOnline set and emit usersOnline event', async () => {
    usersOnline.add('user1')

    const disconnectCallback = socket.on.mock.calls.find(([event]) => event === 'disconnect')[1]

    await disconnectCallback()

    expect(usersOnline.has('user1')).toBe(false)
    expect(io.emit).toHaveBeenCalledWith('usersOnline', Array.from(usersOnline))
  })

  test('should not delete the user from usersOnline when the user has at least one active session', async () => {
    usersOnline.add('user1')
    io.sockets.adapter.rooms.set('user1', 'socketId')

    const disconnectCallback = socket.on.mock.calls.find(([event]) => event === 'disconnect')[1]

    await disconnectCallback()

    expect(usersOnline.has('user1')).toBe(true)
    expect(io.emit).not.toHaveBeenCalled()
  })

  test('should call disconnect and do nothing if socket.user is undefined', async () => {
    socket.user = undefined

    const disconnectCallback = socket.on.mock.calls.find(([event]) => event === 'disconnect')[1]

    await disconnectCallback()

    expect(io.emit).not.toHaveBeenCalled()
  })
})
