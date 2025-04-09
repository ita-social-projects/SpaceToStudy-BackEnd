require('~/initialization/envSetup')
const {
  authMiddleware,
  authSocketMiddleware,
  restrictTo,
  ownershipMiddleware,
  availabilityMiddleware
} = require('~/middlewares/auth')
const { createUnauthorizedError, createForbiddenError } = require('~/utils/errorsHelper')
const tokenService = require('~/services/token')
const userService = require('~/services/user')

const mockNextFunc = jest.fn()
const unauthorizedError = createUnauthorizedError()
const forbiddenError = createForbiddenError()
const mockResponse = {}

jest.mock('~/services/user', () => ({
  checkOwnership: jest.fn(),
  checkAvailability: jest.fn()
}))

describe('Auth middleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should throw UNAUTHORIZED error when access token is not given', () => {
    const mockRequest = { cookies: {} }

    const middlewareFunc = () => authMiddleware(mockRequest, mockResponse, mockNextFunc)

    expect(middlewareFunc).toThrow(unauthorizedError)
  })

  it('should throw UNAUTHORIZED error when access token is invalid', () => {
    const mockRequest = { cookies: { accessToken: 'token' } }

    const middlewareFunc = () => authMiddleware(mockRequest, mockResponse, mockNextFunc)

    expect(middlewareFunc).toThrow(unauthorizedError)
  })

  it('should save userData from accessToken to a request object', () => {
    const payload = { userId: 'testId' }
    const { accessToken } = tokenService.generateTokens(payload)
    const mockRequest = { cookies: { accessToken } }

    authMiddleware(mockRequest, mockResponse, mockNextFunc)

    expect(mockRequest.user).toEqual(expect.objectContaining(payload))
  })
})

describe('Auth Socket Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call next with UNAUTHORIZED if cookie header is missing', () => {
    const socket = {
      request: {
        headers: {}
      }
    }

    authSocketMiddleware(socket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(unauthorizedError)
  })

  it('should parse accessToken from socket cookies', () => {
    const payload = { userId: 'testId' }
    const { accessToken } = tokenService.generateTokens(payload)

    const cookieHeader = `accessToken=${accessToken}`
    const socket = {
      request: {
        headers: {
          cookie: cookieHeader
        }
      }
    }

    authSocketMiddleware(socket, mockNextFunc)

    expect(socket.user).toEqual(expect.objectContaining(payload))
    expect(mockNextFunc).toHaveBeenCalledWith()
  })

  it('should throw UNAUTHORIZED error when access token is invalid', () => {
    const cookieHeader = `accessToken=${'test'}`
    const socket = {
      request: {
        headers: {
          cookie: cookieHeader
        }
      }
    }

    authSocketMiddleware(socket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(unauthorizedError)
  })

  it('should throw UNAUTHORIZED error when access token is not given', () => {
    const cookieHeader = 'testCookie=value123'
    const socket = {
      request: {
        headers: {
          cookie: cookieHeader
        }
      }
    }

    authSocketMiddleware(socket, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(unauthorizedError)
  })
})

describe('restrictTo middleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call next if user has allowed role', () => {
    const mockRequest = { user: { role: 'admin' } }
    const middleware = restrictTo('admin', 'tutor')

    middleware(mockRequest, mockResponse, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith()
  })

  it('should call next with ForbiddenError if user role is not allowed', () => {
    const mockRequest = { user: { role: 'admin' } }
    const middleware = restrictTo('student', 'tutor')

    middleware(mockRequest, mockResponse, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledWith(forbiddenError)
  })
})

describe('ownershipMiddleware', () => {
  const mockModel = {
    findById: jest.fn().mockResolvedValue({ _id: 'resource123', author: 'user456' })
  }

  const mockRequest = {
    params: { id: 'resource123' },
    user: { id: 'user456' }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call userService.checkOwnership with correct arguments', async () => {
    const middleware = ownershipMiddleware(mockModel, ['author'])

    await middleware(mockRequest, mockResponse, mockNextFunc)

    expect(userService.checkOwnership).toHaveBeenCalledWith(mockModel, ['author'], 'resource123', 'user456', null)
  })
})

describe('availabilityMiddleware', () => {
  const mockModel = {
    findById: jest.fn().mockResolvedValue({ _id: 'resource123', author: 'user456' })
  }
  const mockRelationshipModel = {}

  const mockRequest = {
    params: { id: 'resource123' },
    user: { id: 'user456' }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call userService.checkAvailability with correct arguments', async () => {
    const middleware = availabilityMiddleware(mockModel, mockRelationshipModel, 'open')

    await middleware(mockRequest, mockResponse, mockNextFunc)

    expect(userService.checkAvailability).toHaveBeenCalledWith({
      model: mockModel,
      relationshipModel: mockRelationshipModel,
      resourceId: 'resource123',
      userId: 'user456',
      expectedAvailability: 'open'
    })
  })
})
