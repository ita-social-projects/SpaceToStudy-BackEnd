const messageHandler = require('~/event-handlers/messageHandler')
const messageService = require('~/services/message')
const logger = require('~/logger/logger')

jest.mock('~/services/message')
jest.mock('~/logger/logger')

describe('messageHandler', () => {
  let io, socket

  beforeEach(() => {
    io = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    }
    socket = {
      on: jest.fn(),
      user: { id: 'user1' }
    }

    messageHandler(io, socket)
  })

  it('should send message and emit receiveMessage and messageDeliveredConfirmation events on success', async () => {
    const data = {
      tempMessageId: 'temp123',
      authorId: 'user1',
      authorRole: 'admin',
      receiverId: 'user2',
      receiverRole: 'user',
      text: 'Hello',
      chatId: 'chat123'
    }

    const newMessage = { id: 'message123', text: 'Hello' }
    messageService.sendMessage.mockResolvedValue(newMessage)

    const sendMessageCallback = socket.on.mock.calls.find((call) => call[0] === 'sendMessage')[1]
    await sendMessageCallback(data)

    expect(messageService.sendMessage).toHaveBeenCalledWith('user1', 'admin', {
      member: 'user2',
      memberRole: 'user',
      chat: 'chat123',
      text: 'Hello'
    })

    expect(io.to).toHaveBeenCalledWith('user2')
    expect(io.emit).toHaveBeenCalledWith('receiveMessage', newMessage)

    const deliveredConfirmationPayload = {
      tempMessageId: data.tempMessageId,
      newMessageId: newMessage.id
    }
    expect(io.to).toHaveBeenCalledWith('user1')
    expect(io.emit).toHaveBeenCalledWith('messageDeliveredConfirmation', deliveredConfirmationPayload)
  })

  it('should emit sendMessageFailed on error when sending message', async () => {
    const data = {
      tempMessageId: 'temp123',
      authorId: 'user1',
      authorRole: 'admin',
      receiverId: 'user2',
      receiverRole: 'user',
      text: 'Hello',
      chatId: 'chat123'
    }

    messageService.sendMessage.mockRejectedValue(new Error('Failed to send message'))

    const sendMessageCallback = socket.on.mock.calls.find((call) => call[0] === 'sendMessage')[1]
    await sendMessageCallback(data)

    expect(logger.error).toHaveBeenCalled()
    expect(io.to).toHaveBeenCalledWith('user1')
    expect(io.emit).toHaveBeenCalledWith('sendMessageFailed', 'temp123')
  })

  it('should read message and emit messageSeenConfirmation event on success', async () => {
    const data = {
      messageId: 'message123',
      authorId: 'user1'
    }

    const messageSeen = { id: 'message123', isRead: true }
    messageService.readMessage.mockResolvedValue(messageSeen)

    const readMessageCallback = socket.on.mock.calls.find((call) => call[0] === 'messageSeen')[1]
    await readMessageCallback(data)

    expect(messageService.readMessage).toHaveBeenCalledWith('message123')
    expect(io.to).toHaveBeenCalledWith('user1')
    expect(io.emit).toHaveBeenCalledWith('messageSeenConfirmation', messageSeen.id)
  })

  it('should log error on failure when reading message', async () => {
    const data = {
      messageId: 'message123',
      authorId: 'user1'
    }

    messageService.readMessage.mockRejectedValue(new Error('Failed to read message'))

    const readMessageCallback = socket.on.mock.calls.find((call) => call[0] === 'messageSeen')[1]
    await readMessageCallback(data)

    expect(logger.error).toHaveBeenCalled()
  })

  it('should emit typingStatus event when user sends typing status', () => {
    const data = {
      chatId: 'chat123',
      receiverId: 'user2'
    }

    const sendTypingStatusCallback = socket.on.mock.calls.find((call) => call[0] === 'sendTypingStatus')[1]
    sendTypingStatusCallback(data)

    expect(io.to).toHaveBeenCalledWith('user2')
    expect(io.emit).toHaveBeenCalledWith('typingStatus', data.chatId)
  })
})
