const { serverInit, serverCleanup } = require('~/test/setup')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const User = require('~/models/user')
const Role = require('~/models/role')
const { USER_NOT_FOUND } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')

describe('Admin controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe('admins endpoint', () => {
    it('should get admins', async () => {
      
    })
  })

  describe('admins/:id endpoint', () => {
    it('should get admin by id', async () => {
      
    })

    it('should throw USER_NOT_FOUND', async () => {
      
    })
  })
})
