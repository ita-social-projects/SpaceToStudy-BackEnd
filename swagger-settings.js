const {
  config: { SERVER_URL }
} = require('~/app/configs/config')

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
