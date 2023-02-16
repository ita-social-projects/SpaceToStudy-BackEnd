const userService = require('~/services/user')
const emailService = require('~/services/email')
const emailSubject = require('~/consts/emailSubject')
const { checkLastLogin } = require('~/cron-jobs/checkForLastLogin')

const mockedLastLoginDateToSendEmail = new Date(2023, 1, 32, 0, 0, 0, 0)
const mockedLastLoginDateToDeleteUser = new Date(2023, 1, 1, 0, 0, 0, 0)

const mockedUser = {
  email: 'cat@gmail.com',
  firstName: 'cat',
  language: 'en',
  _id: 'testId'
}

jest.mock('~/services/user', () => ({
  deleteUser: jest.fn()
}))
jest.mock('~/services/email', () => ({
  sendEmail: jest.fn()
}))

let mockedUsersList

describe('checkForLastUserLogin cron-job', () => {
  beforeEach(async () => {
    mockedUsersList = [{ ...mockedUser, lastLogin: mockedLastLoginDateToSendEmail }]
    userService.getUsers = jest.fn(() => mockedUsersList)
    const mockedCurrentDate = new Date(2023, 7, 23, 25, 0, 0, 0)
    jest.useFakeTimers('modern').setSystemTime(mockedCurrentDate)
  })

  it('should send email if last login date is equal to days to send email', async () => {
    await checkLastLogin()

    expect(userService.getUsers).toHaveBeenCalledTimes(1)
    expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      mockedUser.email,
      emailSubject.LONG_TIME_WITHOUT_LOGIN,
      mockedUser.language,
      { firstName: mockedUser.firstName }
    )
  })

  it('should delete user if last login date is equal or more to days to delete user', async () => {
    mockedUsersList = [{ ...mockedUser, lastLogin: mockedLastLoginDateToDeleteUser }]
    userService.getUsers.mockImplementation(() => mockedUsersList)

    await checkLastLogin()

    expect(userService.getUsers).toHaveBeenCalledTimes(1)
    expect(userService.deleteUser).toHaveBeenCalledTimes(1)
    expect(userService.deleteUser).toHaveBeenCalledWith(mockedUser._id)
  })

  it('should return array of undefined if user lastLogin date is less than days to send email', async () => {
    const optimalDate = new Date(2023, 5, 23, 25, 0, 0, 0)
    mockedUsersList = [{ ...mockedUser, lastLogin: optimalDate }]
    userService.getUsers.mockImplementation(() => mockedUsersList)

    const res = await checkLastLogin()

    expect(userService.getUsers).toHaveBeenCalledTimes(1)
    expect(res.length).toBe(1)
    expect(res).toContain(undefined)
  })
  it('should return array of undefined if user has no lastLogin field', async () => {
    userService.getUsers.mockImplementation(() => [mockedUser])

    const res = await checkLastLogin()

    expect(userService.getUsers).toHaveBeenCalledTimes(1)
    expect(res.length).toBe(1)
    expect(res).toContain(undefined)
  })
})
