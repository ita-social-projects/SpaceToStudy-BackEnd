const fs = require('fs')
const path = require('path')
const { createServer: createHttpsServer } = require('https')
const {
  config: { SSL_CERT_PATH, SSL_KEY_PATH, NODE_ENV }
} = require('~/configs/config')

const httpsServerSetup = (app) => {
  if (NODE_ENV === 'production') {
    return createHttpsServer(app)
  } else {
    const options = {
      key: fs.readFileSync(path.resolve(__dirname, SSL_KEY_PATH)),
      cert: fs.readFileSync(path.resolve(__dirname, SSL_CERT_PATH)),
      secureProtocol: 'TLS_method'
    }

    return createHttpsServer(options, app)
  }
}

module.exports = httpsServerSetup
