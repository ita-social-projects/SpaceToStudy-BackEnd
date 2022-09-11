const tokenService = require('~/services/token')
const userService = require('~/services/user')
const {removeUsersWithUnconfirmedEmail} = require('~/cron-jobs/removeUnverifiedUsers')

const mockedUsersList = [{
  user:{
    isEmailConfirmed:false
  },
  confirmToken:'78fdh78fsd78h'
}]

jest.mock('~/services/token',()=>({
  findTokensWithUsersByParams: jest.fn(() => mockedUsersList),
  validateConfirmToken: jest.fn(),
  findToken: jest.fn(() => (
    {
      userId:'someId',
    }))
    ,
    removeConfirmToken: jest.fn()
}))
jest.mock('~/services/user',()=>({
  deleteUser: jest.fn()

}))

describe('removeUsersWithUnconfirmedEmail', () => {
    it('should removes unconfirmed users successfully', async () => {
      await removeUsersWithUnconfirmedEmail()

      expect(userService.deleteUser).toHaveBeenCalledWith('someId')
      expect(userService.deleteUser).toHaveBeenCalledTimes(1)
      expect(tokenService.removeConfirmToken).toHaveBeenCalledWith('78fdh78fsd78h')
      
    })
    
    it('should returns if users with confirm token are not exists', async () => {
      tokenService.findTokensWithUsersByParams.mockImplementation(() => [])
      const res = await removeUsersWithUnconfirmedEmail()
      
      expect(tokenService.findTokensWithUsersByParams).toHaveBeenCalled()
      expect(res).toBeUndefined()
  
    })

    it('should returns if confirm token is valid', async () => {
      tokenService.validateConfirmToken.mockImplementation(() => (
        {
          userId:'id'
        }
      ))
      const res = await removeUsersWithUnconfirmedEmail()
      
      expect(tokenService.validateConfirmToken).toHaveBeenCalledTimes(1)
      expect(res).toBeUndefined()
  
    })

    it('should returns if confirm token data is not exists', async () => {
      tokenService.findToken.mockImplementation(() => jest.fn())
      const res = await removeUsersWithUnconfirmedEmail()
      
      expect(tokenService.findToken).toHaveBeenCalledTimes(1)
      expect(res).toBeUndefined()
  
    })

})
