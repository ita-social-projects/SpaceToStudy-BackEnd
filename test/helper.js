const chai = require('chai')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

global.expect = chai.expect

const sinon = require('sinon')

before(() => {
  global.sandbox = sinon.createSandbox()
})
beforeEach(() => {
  global.sandbox.restore()
})
