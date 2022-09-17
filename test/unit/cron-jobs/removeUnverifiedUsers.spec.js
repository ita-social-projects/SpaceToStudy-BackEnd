const tokenService = require('~/services/token')
const userService = require('~/services/user')
const { removeUsersWithUnconfirmedEmail } = require('~/cron-jobs/removeUnverifiedUsers')

const userId = 'testId'
const confirmToken = '78fdh78fsd78h'

const mockedUsersList = [
  {
    user: {
      isEmailConfirmed: false
    },
    confirmToken
  }
]

jest.mock('~/services/token', () => ({
  findTokensWithUsersByParams: jest.fn(() => mockedUsersList),
  validateConfirmToken: jest.fn(),
  findToken: jest.fn(() => ({
    userId
  })),
  removeConfirmToken: jest.fn()
}))

jest.mock('~/services/user', () => ({
  deleteUser: jest.fn()
}))

describe('removeUsersWithUnconfirmedEmail cron-job', () => {
  it('should removes unconfirmed users successfully', async () => {
    await removeUsersWithUnconfirmedEmail()

    expect(userService.deleteUser).toHaveBeenCalledWith(userId)
    expect(userService.deleteUser).toHaveBeenCalledTimes(1)
    expect(tokenService.removeConfirmToken).toHaveBeenCalledWith(confirmToken)
  })

  it('should return if tge users with confirm token do not exist', async () => {
    tokenService.findTokensWithUsersByParams.mockImplementation(() => [])
    const res = await removeUsersWithUnconfirmedEmail()

    expect(tokenService.findTokensWithUsersByParams).toHaveBeenCalled()
    expect(res).toBeUndefined()
  })

  it('should return if the confirm token is valid', async () => {
    tokenService.validateConfirmToken.mockImplementation(() => ({
      userId: 'id'
    }))
    const res = await removeUsersWithUnconfirmedEmail()

    expect(tokenService.validateConfirmToken).toHaveBeenCalledTimes(1)
    expect(res).toBeUndefined()
  })

  it('should return if the confirm token data does not exist', async () => {
    tokenService.findToken.mockImplementation(() => jest.fn())
    const res = await removeUsersWithUnconfirmedEmail()

    expect(tokenService.findToken).toHaveBeenCalledTimes(1)
    expect(res).toBeUndefined()
  })
})
