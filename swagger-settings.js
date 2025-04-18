const {
  config: { HTTP_SERVER_URL, HTTPS_SERVER_URL, USE_SSL }
} = require('~/configs/config')

const SERVER_URL = USE_SSL === 'true' ? HTTPS_SERVER_URL : HTTP_SERVER_URL

const swagger = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API for space2study',
      version: '1.0.0',
      description: 'space2study REST API'
    },
    servers: [
      {
        url: SERVER_URL
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'Enter your cookie for authentication'
        }
      }
    }
  },
  apis: ['./docs/**/*.yaml']
}

module.exports = swagger
