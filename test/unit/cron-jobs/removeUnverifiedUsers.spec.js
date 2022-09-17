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
  removeConfirmToken: jest.fn()
}))

jest.mock('~/services/user', () => ({
  deleteUser: jest.fn()
}))

describe('removeUsersWithUnconfirmedEmail cron-job', () => {
  beforeEach(() => {
    tokenService.findTokensWithUsersByParams = jest.fn(() => mockedUsersList)
    tokenService.validateConfirmToken = jest.fn()
    tokenService.findToken = jest.fn(() => ({
      user: userId,
      confirmToken
    }))
  })
  it('should remove unconfirmed users successfully', async () => {
    await removeUsersWithUnconfirmedEmail()

    expect(userService.deleteUser).toHaveBeenCalledWith(userId)
    expect(userService.deleteUser).toHaveBeenCalledTimes(1)
    expect(tokenService.removeConfirmToken).toHaveBeenCalledWith(confirmToken)
  })

  it('should return if the users with confirm token do not exist', async () => {
    tokenService.findTokensWithUsersByParams.mockImplementation(() => [])
    const res = await removeUsersWithUnconfirmedEmail()

    expect(tokenService.findTokensWithUsersByParams).toHaveBeenCalled()
    expect(res).toBeUndefined()
  })

  it('should return if the confirm token is valid', async () => {
    tokenService.validateConfirmToken.mockImplementation(() => ({ id: userId }))

    const res = await removeUsersWithUnconfirmedEmail()

    expect(tokenService.validateConfirmToken).toHaveBeenCalledTimes(1)
    expect(res).toBeUndefined()
  })

  it('should return if the confirm token data does not exist', async () => {
    tokenService.findToken.mockImplementation(() => null)
    const res = await removeUsersWithUnconfirmedEmail()

    expect(tokenService.findToken).toHaveBeenCalledTimes(1)
    expect(res).toBeUndefined()
  })
})
